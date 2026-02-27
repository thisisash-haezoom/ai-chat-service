import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

/**
 * POST /api/chats/[workspaceId]/message
 *
 * 사용자 메시지를 받아서:
 * 1. 사용자 메시지를 DB에 저장
 * 2. Claude API에 요청
 * 3. 응답을 SSE로 스트리밍
 *
 * 요청 본문:
 * {
 *   "content": "사용자 메시지",
 *   "agent_id": "에이전트 UUID (선택사항)"
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const supabase = await createClient();

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // params는 Promise 형태이므로 await 필요
    const { workspaceId } = await params;

    // 워크스페이스 소유 확인
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .select('id')
      .eq('id', workspaceId)
      .eq('owner_id', user.id)
      .single();

    if (workspaceError || !workspace) {
      console.error('워크스페이스 조회 실패:', {
        workspaceId,
        userId: user.id,
        workspaceError: workspaceError?.message,
        workspaceData: workspace,
      });
      return NextResponse.json(
        { success: false, error: 'Workspace not found or unauthorized', debug: { workspaceId, userId: user.id } },
        { status: 403 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();
    const { content, agent_id } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'content is required' },
        { status: 400 }
      );
    }

    // 워크스페이스의 채팅 세션 조회
    const { data: chats, error: chatsError } = await supabase
      .from('chats')
      .select('id')
      .eq('workspace_id', workspaceId)
      .limit(1);

    if (chatsError || !chats || chats.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No chat session found' },
        { status: 404 }
      );
    }

    const chatId = chats[0].id;

    // 1. 사용자 메시지를 DB에 저장
    const { data: userMessage, error: userMessageError } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_type: 'USER',
        sender_id: user.id,
        content: content.trim(),
      })
      .select()
      .single();

    if (userMessageError || !userMessage) {
      console.error('Save user message error:', userMessageError);
      return NextResponse.json(
        { success: false, error: 'Failed to save message' },
        { status: 500 }
      );
    }

    // 2. 에이전트 정보 조회
    let selectedAgent = null;
    if (agent_id) {
      const { data: agent } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agent_id)
        .single();
      selectedAgent = agent;
    } else {
      // agent_id가 없으면 PM(James)을 기본값으로 사용
      const { data: agent } = await supabase
        .from('agents')
        .select('*')
        .eq('role', 'PM')
        .limit(1)
        .single();
      selectedAgent = agent;
    }

    if (!selectedAgent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    // 3. 과거 메시지 컨텍스트 조회 (최근 10개)
    const { data: previousMessages } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .range(0, 9); // 최신 10개

    // 메시지 컨텍스트 구성 (역순)
    const messageContext = (previousMessages || [])
      .reverse()
      .filter((msg) => msg.id !== userMessage.id) // 방금 저장한 메시지 제외
      .map((msg) => `${msg.sender_type === 'AGENT' ? selectedAgent.name : 'User'}: ${msg.content}`)
      .join('\n');

    // 4. Claude API 호출
    const systemPrompt = `${selectedAgent.system_prompt}

현재 워크스페이스: ${workspace.id}
당신의 역할: ${selectedAgent.role}
당신의 이름: ${selectedAgent.name}

이전 대화 기록:
${messageContext}`;

    const apiResponse = await callClaudeAPI(
      systemPrompt,
      content.trim()
    );

    if (!apiResponse.success) {
      return NextResponse.json(
        { success: false, error: apiResponse.error || 'Claude API call failed' },
        { status: 500 }
      );
    }

    // 5. Claude 응답을 DB에 저장
    const { error: agentMessageError } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_type: 'AGENT',
        sender_id: selectedAgent.id,
        content: apiResponse.data.content,
      });

    if (agentMessageError) {
      console.error('Save agent message error:', agentMessageError);
    }

    // 6. 크레딧 차감
    try {
      // 6-1. 사용자의 현재 크레딧 조회
      const { data: userData } = await supabase
        .from('users')
        .select('credits')
        .eq('id', user.id)
        .single();

      if (userData) {
        const creditCost = selectedAgent.hourly_rate || 1; // 기본값 1
        const newCredits = Math.max(0, userData.credits - creditCost);

        // 6-2. 크레딧 업데이트
        const adminClient = await createAdminClient();
        await adminClient
          .from('users')
          .update({
            credits: newCredits,
          })
          .eq('id', user.id);
      }
    } catch (creditError) {
      console.error('크레딧 차감 실패:', creditError);
      // 크레딧 차감 실패는 메시지 저장은 되었으므로 계속 진행
    }

    // 7. SSE 스트리밍 응답
    const encoder = new TextEncoder();
    const customReadable = new ReadableStream({
      async start(controller) {
        // 메시지 스트리밍 (실제로는 Claude API에서 스트리밍받기)
        const text = apiResponse.data.content;
        const words = text.split(' ');

        for (const word of words) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'text', content: word + ' ' })}\n\n`)
          );
          await new Promise((resolve) => setTimeout(resolve, 10)); // 타이핑 효과
        }

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'done', agentName: selectedAgent.name, agentRole: selectedAgent.role })}\n\n`
          )
        );
        controller.close();
      },
    });

    return new NextResponse(customReadable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('POST /api/chats/[workspaceId]/message error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Claude API 호출
 */
async function callClaudeAPI(
  systemPrompt: string,
  userMessage: string
): Promise<{ success: boolean; data?: { content: string }; error?: string }> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userMessage,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Claude API error:', errorData);
      return {
        success: false,
        error: errorData.error?.message || 'Claude API error',
      };
    }

    const data = await response.json();

    return {
      success: true,
      data: {
        content:
          data.content[0].type === 'text'
            ? data.content[0].text
            : 'No response from Claude',
      },
    };
  } catch (error) {
    console.error('callClaudeAPI error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
