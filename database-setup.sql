-- ===============================================
-- AI-CHAT-SERVICE 데이터베이스 스키마
-- Supabase SQL Editor에서 실행하세요
-- ===============================================

-- 1️⃣ users 테이블 (사용자 정보)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url VARCHAR(255),
  subscription_tier VARCHAR(50) DEFAULT 'FREE', -- FREE, PRO, ENTERPRISE
  credits INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2️⃣ workspaces 테이블 (프로젝트/채널)
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, ARCHIVED
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3️⃣ agents 테이블 (AI 에이전트 - 시스템에서 사전 정의)
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL, -- PM, DESIGNER, FRONTEND, BACKEND, QA, DATA
  system_prompt TEXT,
  hourly_rate INT DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4️⃣ chats 테이블 (대화 세션)
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5️⃣ messages 테이블 (메시지 로그)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_type VARCHAR(50) NOT NULL, -- USER, AGENT, SYSTEM
  sender_id UUID, -- user.id 또는 agent.id
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6️⃣ tasks 테이블 (칸반 태스크)
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  assignee_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'TODO', -- TODO, IN_PROGRESS, IN_REVIEW, DONE
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- 인덱스 (검색/조회 성능 향상)
-- ===============================================

CREATE INDEX idx_workspaces_owner_id ON workspaces(owner_id);
CREATE INDEX idx_chats_workspace_id ON chats(workspace_id);
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_tasks_workspace_id ON tasks(workspace_id);
CREATE INDEX idx_tasks_status ON tasks(status);

-- ===============================================
-- 기본 에이전트 데이터 삽입
-- ===============================================

INSERT INTO agents (name, role, system_prompt, hourly_rate) VALUES
  (
    'James',
    'PM',
    '당신은 프로젝트 매니저 James입니다. 사용자의 지시를 듣고 팀을 조율하며, 진행 상황을 보고하는 역할을 합니다.',
    15
  ),
  (
    'Sarah',
    'DESIGNER',
    '당신은 UX/UI 디자이너 Sarah입니다. 사용자의 요청에 따라 디자인 시안을 작성하고 제안합니다.',
    12
  ),
  (
    'Kevin',
    'BACKEND',
    '당신은 백엔드 개발자 Kevin입니다. 데이터베이스, API, 서버 로직을 담당합니다.',
    18
  ),
  (
    'Alex',
    'FRONTEND',
    '당신은 프론트엔드 개발자 Alex입니다. UI 구현, 상태 관리, 클라이언트 로직을 담당합니다.',
    18
  ),
  (
    'Emma',
    'QA',
    '당신은 QA 엔지니어 Emma입니다. 버그 찾기, 테스트 케이스 작성, 품질 보증을 담당합니다.',
    10
  );

-- ===============================================
-- Row-Level Security (RLS) 설정 - 보안
-- ===============================================

-- users: 본인 데이터만 조회 가능
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_read ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY users_update ON users
  FOR UPDATE USING (auth.uid() = id);

-- workspaces: 소유자만 접근 가능
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY workspaces_read ON workspaces
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY workspaces_insert ON workspaces
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY workspaces_update ON workspaces
  FOR UPDATE USING (auth.uid() = owner_id);

-- chats: 워크스페이스 소유자만 접근
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
CREATE POLICY chats_read ON chats
  FOR SELECT USING (
    workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
  );

CREATE POLICY chats_insert ON chats
  FOR INSERT WITH CHECK (
    workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
  );

-- messages: 워크스페이스 소유자만 접근
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY messages_read ON messages
  FOR SELECT USING (
    chat_id IN (
      SELECT c.id FROM chats c
      WHERE c.workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
    )
  );

CREATE POLICY messages_insert ON messages
  FOR INSERT WITH CHECK (
    chat_id IN (
      SELECT c.id FROM chats c
      WHERE c.workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
    )
  );

-- tasks: 워크스페이스 소유자만 접근
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY tasks_read ON tasks
  FOR SELECT USING (
    workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
  );

CREATE POLICY tasks_insert ON tasks
  FOR INSERT WITH CHECK (
    workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
  );

CREATE POLICY tasks_update ON tasks
  FOR UPDATE USING (
    workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
  );

-- agents: 모두 읽기 가능 (삭제/수정은 불가)
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY agents_read ON agents
  FOR SELECT USING (true);
