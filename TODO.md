# 🛠 TODO: Backend Technical Specification

이 문서는 `AI-Chat-Service`의 실질적인 구동을 위한 백엔드 구조 및 데이터 모델링 사양을 정의합니다.

## 1. Authentication (Auth)
- **Provider:** Supabase Auth
- **Method:** Google OAuth 2.0
- **Flow:**
  1. 클라이언트 측 Google 로그인 시도.
  2. Supabase Auth를 통한 세션 생성.
  3. `Next.js Middleware`에서 세션 유무에 따라 `/login` 리다이렉션 처리.
  4. 로그아웃 기능 구현 (Activity Bar 하단 프로필 메뉴 연동).

## 2. Database Schema (Supabase / PostgreSQL)

### `profiles` (사용자 프로필)
- `id`: uuid (PK, referencing auth.users)
- `email`: string
- `full_name`: string
- `avatar_url`: string
- `organization`: string
- `created_at`: timestamp

### `channels` (채팅 방/채널)
- `id`: uuid (PK)
- `name`: string (e.g., "general", "dev-log")
- `description`: text
- `is_private`: boolean
- `created_by`: uuid (FK profiles)
- `created_at`: timestamp

### `messages` (채팅 내역)
- `id`: uuid (PK)
- `channel_id`: uuid (FK channels)
- `sender_id`: uuid (FK profiles)
- `agent_id`: string (시스템 에이전트 발신인 경우)
- `content`: text
- `is_ai`: boolean
- `line_numbers`: integer (UI 렌더링용)
- `created_at`: timestamp

### `user_agents` (사용자가 영입한 에이전트)
- `id`: uuid (PK)
- `user_id`: uuid (FK profiles)
- `agent_key`: string (e.g., "james-pm", "sarah-designer")
- `is_active`: boolean
- `config`: jsonb (커스텀 프롬프트 등)

### `api_keys` (사용자별 API 키 저장소)
- `id`: uuid (PK)
- `user_id`: uuid (FK profiles)
- `provider`: string (OPENAI, ANTHROPIC, GEMINI)
- `key_encrypted`: text (AES-256 암호화 권장)
- `last_used`: timestamp

### `usage_logs` (토큰 사용량 기록)
- `id`: uuid (PK)
- `user_id`: uuid (FK profiles)
- `agent_id`: string
- `model`: string
- `tokens_used`: integer
- `estimated_cost`: decimal

## 3. API Routes (Next.js App Router)

### `GET/POST /api/chat`
- 에이전트와의 실시간 스트리밍 대화 처리.
- Supabase에서 사용자의 API Key를 조회하여 OpenAI/Anthropic SDK 호출.

### `GET/POST /api/agents`
- 마켓플레이스 에이전트 활성/비활성 및 설정 업데이트.

### `GET /api/usage`
- 사용자의 월별 토큰 소모량 및 비용 대시보드 데이터 제공.

## 4. Next Steps
- [ ] Supabase 프로젝트 생성 및 SQL 스키마 실행.
- [ ] `.env.local`에 Supabase URL/KEY 및 Google Client ID 설정.
- [ ] Next.js Server Actions를 활용한 데이터 Fetching 레이어 구축.
- [ ] 실제 AI SDK 연동 및 스트리밍 응답 UI 처리.
