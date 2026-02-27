/**
 * Supabase 데이터베이스 쿼리 헬퍼 함수
 * 클라이언트와 서버 양쪽에서 사용 가능
 */

import { createClient } from '@/utils/supabase/client';
import type {
  User,
  Workspace,
  Message,
  Chat,
  Agent,
  Task,
  MessageWithSender,
  TaskWithAssignee,
} from '@/types/database';

// ============================================
// Users (사용자)
// ============================================

export async function getUser(userId: string): Promise<User | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('getUser error:', error);
    return null;
  }
  return data as User;
}

export async function updateUserProfile(
  userId: string,
  updates: { name?: string; avatar_url?: string }
): Promise<User | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('users')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('updateUserProfile error:', error);
    return null;
  }
  return data as User;
}

// ============================================
// Workspaces (프로젝트/채널)
// ============================================

export async function getWorkspacesByUser(userId: string): Promise<Workspace[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getWorkspacesByUser error:', error);
    return [];
  }
  return (data || []) as Workspace[];
}

export async function getWorkspace(workspaceId: string): Promise<Workspace | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .single();

  if (error) {
    console.error('getWorkspace error:', error);
    return null;
  }
  return data as Workspace;
}

export async function createWorkspace(
  userId: string,
  projectName: string
): Promise<Workspace | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('workspaces')
    .insert({
      owner_id: userId,
      project_name: projectName,
      status: 'ACTIVE',
    })
    .select()
    .single();

  if (error) {
    console.error('createWorkspace error:', error);
    return null;
  }

  // 새 워크스페이스에 기본 채팅 세션 생성
  await createChat(data.id);

  return data as Workspace;
}

// ============================================
// Chats (대화 세션)
// ============================================

export async function createChat(workspaceId: string): Promise<Chat | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('chats')
    .insert({
      workspace_id: workspaceId,
      title: null,
    })
    .select()
    .single();

  if (error) {
    console.error('createChat error:', error);
    return null;
  }
  return data as Chat;
}

export async function getChatsByWorkspace(workspaceId: string): Promise<Chat[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getChatsByWorkspace error:', error);
    return [];
  }
  return (data || []) as Chat[];
}

// ============================================
// Messages (메시지)
// ============================================

export async function getMessagesByChat(
  chatId: string,
  limit: number = 50,
  offset: number = 0
): Promise<MessageWithSender[]> {
  const supabase = createClient();

  // 메시지 가져오기
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('getMessagesByChat error:', error);
    return [];
  }

  // 에이전트 정보 가져오기 (sender_type이 AGENT일 경우)
  const agentIds = (messages || [])
    .filter((msg) => msg.sender_type === 'AGENT')
    .map((msg) => msg.sender_id);

  let agents: Agent[] = [];
  if (agentIds.length > 0) {
    const { data: agentData } = await supabase
      .from('agents')
      .select('*')
      .in('id', agentIds);
    agents = agentData || [];
  }

  // 메시지에 에이전트 정보 추가
  return (messages || []).map((msg) => {
    const agent = agents.find((a) => a.id === msg.sender_id);
    return {
      ...msg,
      senderName: agent?.name,
      senderRole: agent?.role,
      senderColor: getRoleColor(agent?.role),
    } as MessageWithSender;
  });
}

export async function createMessage(
  chatId: string,
  senderType: 'USER' | 'AGENT' | 'SYSTEM',
  content: string,
  senderId?: string
): Promise<Message | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('messages')
    .insert({
      chat_id: chatId,
      sender_type: senderType,
      sender_id: senderId || null,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error('createMessage error:', error);
    return null;
  }
  return data as Message;
}

// ============================================
// Agents (에이전트)
// ============================================

export async function getAgents(): Promise<Agent[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('getAgents error:', error);
    return [];
  }
  return (data || []) as Agent[];
}

export async function getAgent(agentId: string): Promise<Agent | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('id', agentId)
    .single();

  if (error) {
    console.error('getAgent error:', error);
    return null;
  }
  return data as Agent;
}

// ============================================
// Tasks (칸반 태스크)
// ============================================

export async function getTasksByWorkspace(workspaceId: string): Promise<TaskWithAssignee[]> {
  const supabase = createClient();

  // 태스크 가져오기
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getTasksByWorkspace error:', error);
    return [];
  }

  // 에이전트 정보 가져오기
  const assigneeIds = (tasks || [])
    .filter((task) => task.assignee_id)
    .map((task) => task.assignee_id);

  let agents: Agent[] = [];
  if (assigneeIds.length > 0) {
    const { data: agentData } = await supabase
      .from('agents')
      .select('*')
      .in('id', assigneeIds);
    agents = agentData || [];
  }

  // 태스크에 에이전트 정보 추가
  return (tasks || []).map((task) => ({
    ...task,
    assignee: agents.find((a) => a.id === task.assignee_id),
  } as TaskWithAssignee));
}

export async function createTask(
  workspaceId: string,
  title: string,
  description?: string,
  assigneeId?: string
): Promise<Task | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      workspace_id: workspaceId,
      title,
      description: description || null,
      assignee_id: assigneeId || null,
      status: 'TODO',
    })
    .select()
    .single();

  if (error) {
    console.error('createTask error:', error);
    return null;
  }
  return data as Task;
}

export async function updateTask(
  taskId: string,
  updates: {
    status?: string;
    description?: string;
    assignee_id?: string;
  }
): Promise<Task | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tasks')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    console.error('updateTask error:', error);
    return null;
  }
  return data as Task;
}

// ============================================
// 헬퍼 함수
// ============================================

export function getRoleColor(role?: string): string {
  const roleColors: { [key: string]: string } = {
    PM: '#007acc',
    DESIGNER: '#ffbd2e',
    FRONTEND: '#4bb3fd',
    BACKEND: '#27c93f',
    QA: '#e36209',
    DATA: '#c586c0',
  };
  return roleColors[role || ''] || '#cccccc';
}
