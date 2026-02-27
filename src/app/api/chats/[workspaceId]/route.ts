import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * GET /api/chats/[workspaceId]
 * 특정 워크스페이스의 메시지 조회 (페이지네이션)
 * 쿼리 파라미터: ?limit=50&offset=0
 */
export async function GET(
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
      return NextResponse.json(
        { success: false, error: 'Workspace not found or unauthorized' },
        { status: 403 }
      );
    }

    // 페이지네이션 파라미터
    const limit = Math.min(Number(request.nextUrl.searchParams.get('limit')) || 50, 100);
    const offset = Number(request.nextUrl.searchParams.get('offset')) || 0;

    // 워크스페이스의 채팅 세션 조회 (보통 1개)
    const { data: chats, error: chatsError } = await supabase
      .from('chats')
      .select('id')
      .eq('workspace_id', workspaceId)
      .limit(1);

    if (chatsError || !chats || chats.length === 0) {
      return NextResponse.json(
        { success: true, data: { messages: [], hasMore: false, total: 0 } },
        { status: 200 }
      );
    }

    const chatId = chats[0].id;

    // 전체 메시지 개수
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('chat_id', chatId);

    // 메시지 조회 (최신순)
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (messagesError) {
      console.error('getMessages error:', messagesError);
      return NextResponse.json(
        { success: false, error: messagesError.message },
        { status: 500 }
      );
    }

    // 에이전트 정보 가져오기
    const agentIds = (messages || [])
      .filter((msg) => msg.sender_type === 'AGENT')
      .map((msg) => msg.sender_id)
      .filter(Boolean);

    let agents: any[] = [];
    if (agentIds.length > 0) {
      const { data: agentData } = await supabase
        .from('agents')
        .select('*')
        .in('id', agentIds);
      agents = agentData || [];
    }

    // 메시지에 에이전트 정보 추가
    const messagesWithSender = (messages || []).map((msg) => {
      const agent = agents.find((a) => a.id === msg.sender_id);
      return {
        ...msg,
        senderName: agent?.name,
        senderRole: agent?.role,
        senderColor: agent ? getRoleColor(agent.role) : '#cccccc',
      };
    });

    // 역순으로 반환 (오래된 순서로 표시하기 위해)
    messagesWithSender.reverse();

    return NextResponse.json(
      {
        success: true,
        data: {
          messages: messagesWithSender,
          hasMore: offset + limit < (count || 0),
          total: count || 0,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/chats/[workspaceId] error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getRoleColor(role: string): string {
  const roleColors: { [key: string]: string } = {
    PM: '#007acc',
    DESIGNER: '#ffbd2e',
    FRONTEND: '#4bb3fd',
    BACKEND: '#27c93f',
    QA: '#e36209',
    DATA: '#c586c0',
  };
  return roleColors[role] || '#cccccc';
}
