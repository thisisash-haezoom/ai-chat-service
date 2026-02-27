/**
 * 데이터베이스 타입 정의
 * Supabase 테이블과 일치하도록 수동으로 정의
 */

export type SubscriptionTier = 'FREE' | 'PRO' | 'ENTERPRISE';
export type UserRole = 'PM' | 'DESIGNER' | 'FRONTEND' | 'BACKEND' | 'QA' | 'DATA';
export type WorkspaceStatus = 'ACTIVE' | 'ARCHIVED';
export type MessageSenderType = 'USER' | 'AGENT' | 'SYSTEM';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

// ======= Users =======
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  subscription_tier: SubscriptionTier;
  credits: number;
  created_at: string;
  updated_at: string;
}

// ======= Workspaces =======
export interface Workspace {
  id: string;
  owner_id: string;
  project_name: string;
  status: WorkspaceStatus;
  created_at: string;
  updated_at: string;
}

// ======= Agents =======
export interface Agent {
  id: string;
  name: string;
  role: UserRole;
  system_prompt: string;
  hourly_rate: number;
  created_at: string;
}

// ======= Chats =======
export interface Chat {
  id: string;
  workspace_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

// ======= Messages =======
export interface Message {
  id: string;
  chat_id: string;
  sender_type: MessageSenderType;
  sender_id: string | null;
  content: string;
  created_at: string;
}

// 클라이언트에서 사용할 확장된 Message 타입
export interface MessageWithSender extends Message {
  senderName?: string;
  senderRole?: UserRole;
  senderColor?: string;
}

// ======= Tasks =======
export interface Task {
  id: string;
  workspace_id: string;
  assignee_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

// 클라이언트에서 사용할 확장된 Task 타입
export interface TaskWithAssignee extends Task {
  assignee?: Agent;
}

// ======= API 응답 타입 =======

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface GetWorkspacesResponse {
  workspaces: Workspace[];
}

export interface CreateWorkspaceRequest {
  project_name: string;
}

export interface CreateWorkspaceResponse {
  workspace: Workspace;
}

export interface GetChatsResponse {
  messages: MessageWithSender[];
  hasMore: boolean;
  total: number;
}

export interface SendMessageRequest {
  content: string;
  agent_id?: string; // 선택한 에이전트 ID
}

export interface SendMessageResponse {
  message: Message;
}

export interface GetTasksResponse {
  tasks: TaskWithAssignee[];
}

export interface GetActiveAgentsResponse {
  agents: Agent[];
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  assignee_id?: string;
}

export interface CreateTaskResponse {
  task: Task;
}

export interface UpdateTaskRequest {
  status?: TaskStatus;
  description?: string;
}

export interface UpdateTaskResponse {
  task: Task;
}

export interface GetUserProfileResponse {
  user: User;
}

export interface UpdateUserProfileRequest {
  name?: string;
  avatar_url?: string;
}

export interface UpdateUserProfileResponse {
  user: User;
}

export interface GetCreditsHistoryResponse {
  history: {
    id: string;
    agent_name: string;
    cost: number;
    created_at: string;
  }[];
}
