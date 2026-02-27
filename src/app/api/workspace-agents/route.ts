import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

/**
 * GET /api/workspace-agents?workspaceId={workspaceId}
 *
 * 특정 워크스페이스에 설치된 에이전트 목록 조회
 *
 * @param workspaceId - 워크스페이스 ID
 * @returns { success: true, data: { agents: Agent[] } }
 */
export async function GET(request: NextRequest) {
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

    // 쿼리 파라미터 추출
    const url = new URL(request.url);
    const workspaceId = url.searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json(
        { success: false, error: 'workspaceId is required' },
        { status: 400 }
      );
    }

    // 워크스페이스 소유권 확인
    const { data: workspace, error: wsError } = await supabase
      .from('workspaces')
      .select('id')
      .eq('id', workspaceId)
      .eq('owner_id', user.id)
      .single();

    if (wsError || !workspace) {
      return NextResponse.json(
        { success: false, error: 'Workspace not found or unauthorized' },
        { status: 403 }
      );
    }

    // 설치된 에이전트 조회
    const { data: wsAgents, error: agentsError } = await supabase
      .from('workspace_agents')
      .select('agent_id, agents(*)')
      .eq('workspace_id', workspaceId);

    if (agentsError) {
      console.error('workspace_agents 조회 실패:', agentsError);
      return NextResponse.json(
        { success: false, error: agentsError.message },
        { status: 500 }
      );
    }

    const agents = wsAgents?.map((wa: any) => wa.agents) || [];

    return NextResponse.json(
      { success: true, data: { agents } },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/workspace-agents error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workspace-agents
 *
 * 워크스페이스에 에이전트 설치 (추가)
 *
 * 요청 본문: { "workspaceId": "uuid", "agentId": "uuid" }
 * @returns { success: true, message: "Agent installed successfully" }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminClient = await createAdminClient();

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();
    const { workspaceId, agentId } = body;

    if (!workspaceId || !agentId) {
      return NextResponse.json(
        { success: false, error: 'workspaceId and agentId are required' },
        { status: 400 }
      );
    }

    // 워크스페이스 소유권 확인
    const { data: workspace, error: wsError } = await supabase
      .from('workspaces')
      .select('id')
      .eq('id', workspaceId)
      .eq('owner_id', user.id)
      .single();

    if (wsError || !workspace) {
      return NextResponse.json(
        { success: false, error: 'Workspace not found or unauthorized' },
        { status: 403 }
      );
    }

    // 에이전트 존재 확인
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id')
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    // workspace_agents 테이블에 추가
    const { error: insertError } = await adminClient
      .from('workspace_agents')
      .insert({
        workspace_id: workspaceId,
        agent_id: agentId,
      });

    if (insertError) {
      // 중복 설치 시
      if (insertError.code === '23505') {
        return NextResponse.json(
          { success: false, error: 'Agent already installed in this workspace' },
          { status: 409 }
        );
      }
      console.error('workspace_agents 삽입 실패:', insertError);
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Agent installed successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/workspace-agents error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workspace-agents?workspaceId={workspaceId}&agentId={agentId}
 *
 * 워크스페이스에서 에이전트 제거 (언인스톨)
 *
 * @param workspaceId - 워크스페이스 ID
 * @param agentId - 에이전트 ID
 * @returns { success: true, message: "Agent uninstalled successfully" }
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminClient = await createAdminClient();

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 쿼리 파라미터 추출
    const url = new URL(request.url);
    const workspaceId = url.searchParams.get('workspaceId');
    const agentId = url.searchParams.get('agentId');

    if (!workspaceId || !agentId) {
      return NextResponse.json(
        { success: false, error: 'workspaceId and agentId are required' },
        { status: 400 }
      );
    }

    // 워크스페이스 소유권 확인
    const { data: workspace, error: wsError } = await supabase
      .from('workspaces')
      .select('id')
      .eq('id', workspaceId)
      .eq('owner_id', user.id)
      .single();

    if (wsError || !workspace) {
      return NextResponse.json(
        { success: false, error: 'Workspace not found or unauthorized' },
        { status: 403 }
      );
    }

    // workspace_agents 테이블에서 제거
    const { error: deleteError } = await adminClient
      .from('workspace_agents')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('agent_id', agentId);

    if (deleteError) {
      console.error('workspace_agents 삭제 실패:', deleteError);
      return NextResponse.json(
        { success: false, error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Agent uninstalled successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE /api/workspace-agents error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
