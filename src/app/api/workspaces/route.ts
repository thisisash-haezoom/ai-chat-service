import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

/**
 * GET /api/workspaces
 * 현재 사용자의 모든 워크스페이스 조회
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 사용자가 users 테이블에 없으면 추가 (보험용)
    const adminClient = await createAdminClient();
    await adminClient
      .from('users')
      .upsert([{
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        avatar_url: user.user_metadata?.avatar_url || null,
        subscription_tier: 'FREE',
        credits: 0,
      }], { onConflict: 'id' });

    // 사용자의 워크스페이스 조회
    const { data: workspaces, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getWorkspaces error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: { workspaces: workspaces || [] } },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/workspaces error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workspaces
 * 새로운 워크스페이스 생성
 * 요청 본문: { "project_name": "프로젝트명" }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminClient = await createAdminClient();

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 보험: 사용자가 users 테이블에 없으면 추가
    await adminClient
      .from('users')
      .upsert([{
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        avatar_url: user.user_metadata?.avatar_url || null,
        subscription_tier: 'FREE',
        credits: 0,
      }], { onConflict: 'id' });

    // 요청 본문 파싱
    const body = await request.json();
    const { project_name } = body;

    if (!project_name || typeof project_name !== 'string' || project_name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'project_name is required' },
        { status: 400 }
      );
    }

    // 1. 워크스페이스 생성 (Admin client 사용)
    const { data: workspace, error: workspaceError } = await adminClient
      .from('workspaces')
      .insert({
        owner_id: user.id,
        project_name: project_name.trim(),
        status: 'ACTIVE',
      })
      .select()
      .single();

    if (workspaceError || !workspace) {
      console.error('createWorkspace error:', workspaceError);
      return NextResponse.json(
        { success: false, error: workspaceError?.message || 'Failed to create workspace' },
        { status: 500 }
      );
    }

    // 2. 해당 워크스페이스에 기본 채팅 세션 생성 (Admin client)
    const { data: chat, error: chatError } = await adminClient
      .from('chats')
      .insert({
        workspace_id: workspace.id,
        title: null,
      })
      .select()
      .single();

    if (chatError) {
      console.error('createChat error:', chatError);
      // 워크스페이스는 생성되었으나 채팅 생성 실패 - 로그만 기록
    }

    return NextResponse.json(
      { success: true, data: { workspace } },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/workspaces error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workspaces?id=workspaceId
 * 워크스페이스 삭제 (소유자만 가능)
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminClient = await createAdminClient();

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 쿼리 파라미터에서 워크스페이스 ID 추출
    const url = new URL(request.url);
    const workspaceId = url.searchParams.get('id');

    if (!workspaceId) {
      return NextResponse.json(
        { success: false, error: 'workspace id is required' },
        { status: 400 }
      );
    }

    // 워크스페이스 소유권 확인
    const { data: workspace, error: fetchError } = await supabase
      .from('workspaces')
      .select('owner_id')
      .eq('id', workspaceId)
      .single();

    if (fetchError || !workspace) {
      return NextResponse.json(
        { success: false, error: 'Workspace not found' },
        { status: 404 }
      );
    }

    if (workspace.owner_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to delete this workspace' },
        { status: 403 }
      );
    }

    // 워크스페이스 삭제 (연쇄 삭제: chats, messages도 함께 삭제됨 - DB cascade 설정)
    const { error: deleteError } = await adminClient
      .from('workspaces')
      .delete()
      .eq('id', workspaceId)
      .eq('owner_id', user.id);

    if (deleteError) {
      console.error('deleteWorkspace error:', deleteError);
      return NextResponse.json(
        { success: false, error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Workspace deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE /api/workspaces error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
