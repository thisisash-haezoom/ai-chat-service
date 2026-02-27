# 🚀 AI TEAM MATE - 백엔드 개발 및 API 명세서 (BACKENDTODO.md)

이 문서는 `AI-CHAT-SERVICE`의 전체적인 백엔드 시스템 설계, 데이터베이스 아키텍처 모델링, 그리고 페이지별 필수 API 로직을 정의한 마스터 플랜입니다. Supabase (PostgreSQL) + Next.js(App Router/API Routes)를 기준으로 작성되었습니다.

---

## 🏛️ 1. 데이터베이스 아키텍처 (ERD 모델링 예시)

VSC 테마 기반 1인 풀스택 개발 환경에 맞춰, **사용자(User) - 에이전트(Agent) - 워크스페이스(Workspace) - 채팅/작업(Chat/Task)** 이 중심이 되는 구조입니다.

### `[users]` - 사용자 및 구독 관리
사용자 계정과 결제 상태를 관리합니다.
- `id` (uuid, PK) : 사용자 고유 ID
- `email` (varchar) : 로그인 이메일 (Google, Github 연동)
- `name` (varchar) : 사용자 이름/닉네임
- `avatar_url` (varchar) : 프로필 이미지 URL
- `subscription_tier` (enum) : `FREE` | `PRO` | `ENTERPRISE` (요금제 상태)
- `credits` (int) : 현재 보유한 AI 토큰/호출 가능 크레딧
- `created_at` (timestamp) : 가입일지

### `[workspaces]` - 독립된 가상 프로젝트 룸
한 명의 사용자가 여러 프로젝트(워크스페이스)를 생성할 수 있습니다.
- `id` (uuid, PK) : 워크스페이스 고유 ID
- `owner_id` (uuid, FK -> users.id) : 소유자 ID
- `project_name` (varchar) : 프로젝트 명 (예: "랜딩페이지 구축")
- `status` (enum) : `ACTIVE` | `ARCHIVED`
- `created_at` (timestamp)

### `[agents]` - AI 팀원 메타데이터
플랫폼에서 제공하거나 사용자가 고용한 AI 요원 데이터.
- `id` (uuid, PK) : 에이전트 고유 아이디
- `name` (varchar) : 에이전트 이름 (James, Sarah, Kevin 등)
- `role` (enum) : `PM` | `DESIGNER` | `FRONTEND` | `BACKEND` | `QA` | `DATA`
- `system_prompt` (text) : LLM에 주입될 기본 페르소나 프롬프트
- `hourly_rate` (int) : 사용 시 차감될 크레딧 비용

### `[chats]` & `[messages]` - 대화 기록 및 컨텍스트
사용자와 AI 에이전트 간의 VSC 터미널형 채팅 기록입니다.
**`[chats]` (대화방 세션)**
- `id` (uuid, PK)
- `workspace_id` (uuid, FK -> workspaces.id)
- `title` (varchar) : 요약된 대화 주제

**`[messages]` (실제 채팅 로그)**
- `id` (uuid, PK)
- `chat_id` (uuid, FK -> chats.id)
- `sender_type` (enum) : `USER` | `AGENT` | `SYSTEM`
- `sender_id` (uuid, Nullable) : 발신자가 Agent일 경우 agent.id, User일 경우 user.id
- `content` (text) : 마크다운/코드블록이 포함된 텍스트 로그
- `created_at` (timestamp)

### `[tasks]` - 칸반(Kanban) 자동화 보드
AI PM(James) 등이 회의 내용을 바탕으로 자동 생성하는 칸반 티켓.
- `id` (uuid, PK)
- `workspace_id` (uuid, FK -> workspaces.id)
- `assignee_id` (uuid, FK -> agents.id) : 작업이 할당된 AI 에이전트
- `title` (varchar) : 이슈 제목
- `description` (text) : 상세 작업 내용
- `status` (enum) : `TODO` | `IN_PROGRESS` | `IN_REVIEW` | `DONE`
- `updated_at` (timestamp)

---

## 📡 2. 페이지별 필수 API 및 로직(Logic) 사양서

### Phase 1. 온보딩(Onboarding) 및 로그인(Login)
**Next.js Middleware + Supabase Auth Auth 처리 영역**

- **`POST /api/auth/callback`**
  - **Logic:** Google/Github OAuth 로그인 후 콜백. 로그인 성공 시 `users` 테이블에 계정이 없다면 신규 Insert(회원가입 처리), 있다면 로그인 처리. 보안 쿠키(JWT Session) 발급.
- **`POST /api/auth/logout`**
  - **Logic:** 클라이언트 쿠키 삭제 및 세션 파기.

### Phase 2. 메인 대시보드 (`/chat`) - 핵심 AI 상호작용
**채팅, 요원 호출 및 워크스페이스 상태 관리**

- **`GET /api/workspaces`**
  - **Logic:** 현재 로그인한 사용자의 워크스페이스 목록과 현재 입장 중인 세션 호출. 없으면 기본 "Default Workspace" 자동 생성.
- **`GET /api/chats/[workspaceId]`**
  - **Logic:** 해당 프로젝트 화면 진입 시 과거 대화 내역(`messages`) Pagination 조회.
- **`POST /api/chats/[workspaceId]/message` (SSE / WebSocket 권장)**
  - **Logic:**
    1. 사용자의 입력 메시지 DB 저장.
    2. LangChain/OpenAI 기반 라우터 발동 -> *내용을 분석하여 어떤 에이전트(PM, Dev 등)가 대답할지 AI 라우팅 결정*.
    3. 선택된 AI 에이전트의 `system_prompt`와 내역을 묶어 LLM에 질의.
    4. **Server-Sent Events(SSE)** 스트리밍으로 VSC 터미널 타이핑 효과처럼 UI에 실시간 응답 출력.
  - **Side Effect:** AI 응답 과정에서 토큰/크레딧 자동 차감(`users.credits`).

### Phase 3. 에이전트 마켓/상태보드 (`/agents` & `/dashboard`)
**칸반보드 및 내 AI 요원 상태 확인**

- **`GET /api/agents/active`**
  - **Logic:** 내 워크스페이스에 현재 `status="working"` 중인 요원 리스트 반환 (Activity Bar 및 사이드바 렌더링용).
- **`GET /api/tasks?workspace_id=[id]`**
  - **Logic:** 워크스페이스의 우측 칸반 보드용 이슈 티켓 리스트를 상태(`TODO`, `DONE` 등)별로 필터링하여 응답.
- **`POST /api/tasks/webhook`** (내부 System 예약)
  - **Logic:** 채팅 중 AI PM(James)이 "칸반 이슈를 생성했습니다" 라고 판단하면 LLM이 이 시스템 API를 찔러서 DB에 자동으로 티켓을 Insert 함.

### Phase 4. 설정 및 과금 (`/settings`)
**유저 환경설정 및 결제 연동(Stripe / PG)**

- **`GET /api/user/profile`**
  - **Logic:** 잔여 크레딧, 연결된 소셜 계정, 현재 UI 테마(설정값) 조회.
- **`PUT /api/user/profile`**
  - **Logic:** 사용자 닉네임, 알림 수신 동의 여부 업데이트.
- **`POST /api/billing/checkout`**
  - **Logic:** PRO/ENTERPRISE 모델 구독 시 Stripe(또는 Portone 등) Checkout 세션 객체 생성 및 결제 모달 URL 반환.
- **`POST /api/billing/webhook`**
  - **Logic:** 결제 성공 시 PG사 서버가 찔러주는 Webhook 수신. `users.subscription_tier` 승급 및 `credits` 충전 트랜잭션.

---

## 🛠️ 향후 기술 스택 권장안
- **ORM/DB 연동:** Supabase SDK + Prisma (또는 Drizzle ORM) 조합 강력 추천 (TypeScript 타입 안정성 방어)
- **AI/LLM 파이프라인:** `LangChain.js` 또는 `Vercel AI SDK` (`ai` 패키지) 활용. 서버 사이드 엣지(Edge) 환경 스트리밍 렌더링 효율 극대화.
- **State Management:** 서버 데이터 패칭은 `React Query` (`@tanstack/react-query`) 적용하여 대시보드와 칸반 상태 관리.
