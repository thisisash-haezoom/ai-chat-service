# PRD: AI-Chat-Service 백엔드 시스템 & AI 협업 플랫폼

## 1. 소개 (Introduction)

**AI-Chat-Service**는 VS Code 스타일의 IDE 인터페이스를 갖춘 AI 에이전트 협업 플랫폼입니다. 사용자는 Google/Github로 로그인하여 여러 개의 독립적인 워크스페이스(프로젝트)를 생성하고, 각 워크스페이스에서 PM, 개발자, 디자이너, QA 등의 전문화된 AI 에이전트들과 자연어 기반으로 협업할 수 있습니다.

**핵심 가치 제안**:
- 개발자 친화적인 IDE 스타일 UI/UX
- 여러 AI 에이전트의 자동 협업 및 역할 분담
- 프로젝트별 독립적인 워크스페이스 관리
- 실시간 채팅 기반 작업 지시 및 진행 상황 추적
- 칸반 보드를 통한 자동 태스크 관리

---

## 2. 목표 (Goals)

### 사용자 관점
- 사용자는 간단한 자연어로 업무를 지시하고, AI 에이전트 팀이 자동으로 협업하는 경험을 얻는다
- 프로젝트별로 독립적인 워크스페이스를 관리하고, 각 워크스페이스의 진행 상황을 실시간으로 확인한다
- 여러 에이전트의 작업 내역, 진행 상황, 결과물을 한 곳(채팅창)에서 확인한다

### 플랫폼 관점
- Phase 1부터 4까지 단계별로 기능을 구현하여 점진적 확장을 가능하게 한다
- Claude API를 통한 안정적인 AI 기능을 제공한다
- 사용자의 크레딧 사용을 추적하고, 향후 결제 시스템으로 확장 가능하게 한다

---

## 3. 사용자 스토리 (User Stories)

### Phase 1: 온보딩 및 인증

#### US-P1-001: Google/Github 소셜 로그인
**설명**: 사용자는 Google 또는 Github로 간편하게 로그인하고 계정을 자동 생성할 수 있다.

**수락 조건**:
- [ ] Supabase Auth를 통한 Google OAuth 구성 완료
- [ ] Supabase Auth를 통한 Github OAuth 구성 완료
- [ ] 로그인 후 `/chat` 페이지로 자동 리다이렉트
- [ ] 신규 사용자는 `users` 테이블에 자동 생성 (이메일, 이름, 프로필 이미지)
- [ ] 로그인 상태 지속 (JWT 세션)
- [ ] 타입체크 및 린트 통과
- [ ] 브라우저에서 로그인/로그아웃 확인 (dev-browser skill 사용)

#### US-P1-002: 대시보드 페이지 (빈 상태 시작)
**설명**: 로그인 후 사용자는 빈 대시보드를 보고, "프로젝트 추가" 버튼을 통해 자신의 첫 워크스페이스를 생성할 수 있다.

**수락 조건**:
- [ ] 로그인 후 `/chat` 페이지로 이동 (빈 상태)
- [ ] "새 프로젝트 만들기" 또는 "+ 프로젝트 추가" 버튼 표시
- [ ] 사용자가 직접 워크스페이스 생성 (자동 생성 없음)
- [ ] 타입체크 통과

#### US-P1-003: 로그아웃 기능
**설명**: 사용자는 언제든지 로그아웃할 수 있고, 세션이 제거된다.

**수락 조건**:
- [ ] 로그아웃 버튼 구현 (상단 메뉴 또는 설정)
- [ ] `/api/auth/logout` 엔드포인트 구현
- [ ] 클라이언트 쿠키 및 세션 삭제
- [ ] 로그아웃 후 `/login` 페이지로 리다이렉트
- [ ] 타입체크 통과

---

### Phase 2: 메인 대시보드 및 AI 채팅

#### US-P2-001: 워크스페이스/프로젝트 목록 조회
**설명**: 사용자는 자신이 생성한 모든 워크스페이스 목록을 볼 수 있고, 각 워크스페이스를 클릭하여 진입할 수 있다.

**수락 조건**:
- [ ] 왼쪽 사이드바에 워크스페이스 목록 표시
- [ ] `GET /api/workspaces` 엔드포인트 구현 (현재 로그인 사용자의 워크스페이스만)
- [ ] 워크스페이스 아이콘, 이름, 생성일 표시
- [ ] 현재 선택된 워크스페이스 하이라이트
- [ ] 타입체크 통과

#### US-P2-002: 워크스페이스 생성 (채널 추가)
**설명**: 사용자는 새로운 워크스페이스를 생성하여 새로운 프로젝트를 시작할 수 있다.

**수락 조건**:
- [ ] 사이드바에 "+" 버튼으로 새 워크스페이스 생성 모달 제공
- [ ] 워크스페이스 이름 입력 필드
- [ ] `POST /api/workspaces` 엔드포인트 구현
- [ ] 새 워크스페이스 생성 시 기본 채팅 세션도 함께 생성
- [ ] 생성 후 해당 워크스페이스로 자동 이동
- [ ] 타입체크 통과
- [ ] 브라우저에서 워크스페이스 생성 및 전환 확인 (dev-browser skill 사용)

#### US-P2-003: 채팅 메시지 목록 조회 (과거 내역)
**설명**: 사용자가 워크스페이스에 진입하면, 해당 워크스페이스의 과거 채팅 내역이 페이지네이션으로 로드된다.

**수락 조건**:
- [ ] `GET /api/chats/[workspaceId]` 엔드포인트 구현
- [ ] 페이지네이션 지원 (limit=50 기본, offset 파라미터)
- [ ] 메시지 시간순 정렬 (오래된 순)
- [ ] sender_type (USER, AGENT, SYSTEM), sender_id, content, created_at 포함
- [ ] 타입체크 통과

#### US-P2-004: 사용자 메시지 입력 및 전송
**설명**: 사용자는 채팅 입력창에 메시지를 입력하고 전송하여 AI 에이전트에게 업무를 지시한다.

**수락 조건**:
- [ ] 하단 입력창에서 마크다운 포맷 지원
- [ ] 전송 버튼 또는 Enter 키로 메시지 전송
- [ ] `POST /api/chats/[workspaceId]/message` 엔드포인트 구현
- [ ] 메시지가 `messages` 테이블에 저장 (sender_type='USER')
- [ ] 사용자 메시지는 즉시 UI에 표시
- [ ] 타입체크 통과
- [ ] 브라우저에서 메시지 입력 및 표시 확인 (dev-browser skill 사용)

#### US-P2-005: AI 에이전트 선택 및 응답 (기본 구현)
**설명**: 사용자 메시지 전송 후, 사용자가 에이전트를 수동으로 선택하여 해당 에이전트가 Claude API를 호출하여 응답한다.

**수락 조건**:
- [ ] 메시지 전송 시 에이전트 선택 드롭다운 표시 (PM, Developer, Designer, QA, Marketer)
- [ ] 에이전트 선택 시 해당 에이전트의 `system_prompt` 로드
- [ ] Claude API 호출: 사용자 메시지 + 에이전트 system_prompt + 워크스페이스 컨텍스트
- [ ] 응답은 SSE(Server-Sent Events)로 스트리밍 (VSC 터미널 타이핑 효과)
- [ ] 응답 메시지 저장 (sender_type='AGENT', sender_id=agent.id)
- [ ] 사용자 크레딧 자동 차감 (agents.hourly_rate 기준)
- [ ] 타입체크 통과
- [ ] 브라우저에서 에이전트 선택 및 응답 스트리밍 확인 (dev-browser skill 사용)

#### US-P2-006: 에이전트 상태 표시 (활동 바)
**설명**: 활동 바(Activity Bar)에 현재 워크스페이스에서 "작업 중"인 에이전트들을 실시간으로 표시한다.

**수락 조건**:
- [ ] `GET /api/agents/active?workspace_id=[id]` 엔드포인트 구현
- [ ] 활동 바에 현재 활동 중인 에이전트 아이콘 표시
- [ ] 에이전트 호버 시 현재 작업 내용 툴팁 표시
- [ ] 주기적 폴링(5초) 또는 SSE로 상태 업데이트
- [ ] 타입체크 통과

#### US-P2-007: 메시지 마크다운 & 코드블록 렌더링
**설명**: 에이전트가 반환한 메시지가 마크다운, 코드블록, 리스트, 테이블 등을 포함할 수 있으며, UI에서 올바르게 렌더링된다.

**수락 조건**:
- [ ] `react-markdown` + `remark-gfm` 활용
- [ ] 코드블록에 문법 하이라이팅 (syntax highlighting)
- [ ] 인라인 코드, 볼드, 이탤릭 등 마크다운 요소 지원
- [ ] 이미지 링크 표시 가능
- [ ] 타입체크 통과
- [ ] 브라우저에서 마크다운 렌더링 확인 (dev-browser skill 사용)

---

### Phase 3: 칸반 보드 & 에이전트 상태 보드

#### US-P3-001: 칸반 보드 조회
**설명**: 워크스페이스의 우측 패널에 칸반 보드를 표시하여 현재 진행 중인 태스크를 상태별로 확인할 수 있다.

**수락 조건**:
- [ ] `GET /api/tasks?workspace_id=[id]` 엔드포인트 구현
- [ ] 상태별 필터링: TODO, IN_PROGRESS, IN_REVIEW, DONE
- [ ] 각 태스크 카드에 제목, 담당 에이전트, 업데이트 시간 표시
- [ ] 칸반 드래그앤드롭 기능 (Drag & Drop)
- [ ] 타입체크 통과
- [ ] 브라우저에서 칸반 보드 및 드래그앤드롭 확인 (dev-browser skill 사용)

#### US-P3-002: 칸반 태스크 상세 보기
**설명**: 칸반 보드의 태스크를 클릭하면 상세 정보를 모달에서 볼 수 있다.

**수락 조건**:
- [ ] 태스크 클릭 시 모달 팝업
- [ ] 태스크 제목, 설명, 담당자, 상태, 생성일, 업데이트일 표시
- [ ] 상태 변경 드롭다운 (TODO → IN_PROGRESS → IN_REVIEW → DONE)
- [ ] 타입체크 통과

#### US-P3-003: AI PM의 자동 칸반 생성 (시스템)
**설명**: 채팅 중 AI PM이 "칸반 이슈를 생성했습니다"라고 판단하면, 내부적으로 `POST /api/tasks/webhook`을 호출하여 DB에 자동으로 티켓을 생성한다. (향후 자동화 기능)

**수락 조건**:
- [ ] `POST /api/tasks/webhook` 엔드포인트 구현
- [ ] 인증: 내부 API 키 또는 요청 검증
- [ ] 요청 본문: title, description, assignee_id, workspace_id
- [ ] `tasks` 테이블에 저장 (기본 상태: TODO)
- [ ] 생성 후 클라이언트에 알림 전송
- [ ] 타입체크 통과

---

### Phase 4: 설정 및 크레딧/결제 시스템

#### US-P4-001: 사용자 프로필 조회
**설명**: 설정 페이지에서 사용자의 프로필 정보(이메일, 이름, 프로필 이미지, 남은 크레딧, 구독 상태)를 확인할 수 있다.

**수락 조건**:
- [ ] `GET /api/user/profile` 엔드포인트 구현
- [ ] 이메일, 이름, 프로필 이미지, 잔여 크레딧, subscription_tier 표시
- [ ] 타입체크 통과

#### US-P4-002: 사용자 프로필 수정
**설명**: 사용자는 닉네임, 프로필 이미지 등을 수정할 수 있다.

**수락 조건**:
- [ ] `PUT /api/user/profile` 엔드포인트 구현
- [ ] 닉네임, 프로필 이미지 URL 업데이트
- [ ] 수정 후 성공 메시지 표시
- [ ] 타입체크 통과

#### US-P4-003: 크레딧 사용 내역 조회
**설명**: 사용자는 자신의 크레딧 사용 내역을 확인할 수 있다. (선택사항)

**수락 조건**:
- [ ] `GET /api/user/credits/history` 엔드포인트 (선택사항)
- [ ] 최근 사용 내역 10개 표시
- [ ] 에이전트명, 비용, 사용 시간 표시
- [ ] 타입체크 통과

#### US-P4-004: Stripe 결제 연동 (기본 구조)
**설명**: MVP 단계에서는 FREE 요금제만 제공하지만, 향후 PRO/ENTERPRISE 구독을 위한 Stripe 연동 구조를 준비한다.

**수락 조건**:
- [ ] `POST /api/billing/checkout` 엔드포인트 기본 구조 (아직 활성화 안 함)
- [ ] `POST /api/billing/webhook` 엔드포인트 기본 구조
- [ ] Stripe API 키 환경변수 설정 (아직 사용 안 함)
- [ ] `subscription_tier` 및 `credits` 필드가 `users` 테이블에 준비됨
- [ ] 타입체크 통과

---

## 4. 기능 요구사항 (Functional Requirements)

### 인증 & 권한
- **FR-1**: 사용자는 Google/Github OAuth 2.0을 통해 로그인할 수 있다
- **FR-2**: 신규 사용자는 자동으로 `users` 테이블에 생성된다
- **FR-3**: 로그인한 사용자만 `/chat`, `/agents`, `/settings` 페이지 접근 가능 (미들웨어 권한)
- **FR-4**: 로그아웃 시 JWT 세션이 제거된다

### 워크스페이스 관리
- **FR-5**: 사용자는 여러 개의 독립적인 워크스페이스를 생성할 수 있다
- **FR-6**: 각 워크스페이스는 고유한 owner_id를 가지며, 소유자만 접근 가능하다
- **FR-7**: 워크스페이스는 ACTIVE 또는 ARCHIVED 상태를 가진다

### 채팅 & 메시지
- **FR-8**: 사용자 메시지는 즉시 DB에 저장되고 UI에 표시된다
- **FR-9**: AI 에이전트의 응답은 SSE(Server-Sent Events)로 스트리밍되어 실시간 타이핑 효과를 표시한다
- **FR-10**: 각 메시지는 sender_type (USER, AGENT, SYSTEM), sender_id, content, created_at을 포함한다
- **FR-11**: 메시지는 마크다운, 코드블록, 이미지 링크를 포함할 수 있으며, UI에서 올바르게 렌더링된다
- **FR-12**: 과거 메시지는 페이지네이션으로 로드된다 (무한 스크롤 또는 수동 로드)

### AI 에이전트 관리
- **FR-13**: 플랫폼은 기본 5가지 에이전트를 제공한다: PM, Frontend Developer, Backend Developer, Designer, QA Engineer
- **FR-14**: 각 에이전트는 고유한 `system_prompt`, `role`, `hourly_rate`를 가진다
- **FR-15**: 사용자는 메시지 전송 시 에이전트를 수동으로 선택할 수 있다 (MVP 단계)
- **FR-16**: 선택된 에이전트의 system_prompt와 워크스페이스 컨텍스트를 함께 Claude API에 전송한다
- **FR-17**: 에이전트 응답 시 사용자의 크레딧이 자동 차감된다

### 칸반 보드 & 태스크
- **FR-18**: 태스크는 상태 (TODO, IN_PROGRESS, IN_REVIEW, DONE)를 가진다
- **FR-19**: 태스크는 특정 에이전트에 할당될 수 있다
- **FR-20**: 칸반 보드에서 드래그앤드롭으로 태스크 상태를 변경할 수 있다
- **FR-21**: 내부 시스템(AI PM)이 `POST /api/tasks/webhook`을 호출하여 자동으로 태스크를 생성할 수 있다

### 크레딧 & 결제
- **FR-22**: 모든 신규 사용자는 FREE 플랜으로 시작하며, 초기 크레딧 500을 부여받는다 (설정 필요)
- **FR-23**: AI 에이전트 호출 시 크레딧이 차감된다 (agents.hourly_rate 기준)
- **FR-24**: 크레딧이 부족하면 에이전트 호출이 불가능하다
- **FR-25**: 향후 Stripe를 통한 결제 연동을 위한 API 엔드포인트 구조가 준비된다

---

## 5. 범위 밖 (Non-Goals)

- **멀티 에이전트 자동 라우팅**: MVP 단계에서는 사용자가 에이전트를 수동 선택. 자동 라우팅은 향후 고도화
- **에이전트 커스터마이제이션**: 사용자가 커스텀 에이전트를 생성하는 기능은 MVP에 미포함
- **팀 협업 (멀티 사용자)**: 현재는 1인 소유자만 워크스페이스 접근 가능. 팀 초대 기능은 향후 추가
- **파일 업로드 & 관리**: MVP에서는 텍스트 기반 메시지만. 파일 첨부는 향후 추가
- **알림 & 이메일**: 실시간 채팅만 지원. 이메일/푸시 알림은 나중
- **고급 검색 & 필터링**: 단순 페이지네이션만. 고급 검색은 향후
- **데이터 분석 & 대시보드**: 사용 통계, 비용 분석 등은 MVP에 미포함
- **결제 자동화**: Stripe 결제 시스템은 구조만 준비. 실제 결제는 나중에 활성화

---

## 6. 디자인 고려사항 (Design Considerations)

### UI/UX
- **VS Code 스타일**: 왼쪽 Activity Bar, 왼쪽 Sidebar, 메인 에디터 영역, 하단 Panel의 구조 유지
- **채팅 인터페이스**: Slack과 유사하지만, 코드 에디터의 Terminal/Output 패널 느낌
- **색상 팔레트**: VS Code Dark 테마 (Dark Gray/Black) + 포인트 색상 (Blue, Orange, Green, Purple)
- **반응형 디자인**: 데스크톱 중심이지만 태블릿에서도 사용 가능하도록

### 컴포넌트 재사용
- 기존 `shadcn/ui` 컴포넌트 활용 (Button, Input, Dialog, Dropdown, Card 등)
- 기존 `Lucide React` 아이콘 활용
- 기존 마크다운 렌더링 (`react-markdown`, `remark-gfm`) 그대로 사용

---

## 7. 기술적 고려사항 (Technical Considerations)

### 데이터베이스 & ORM
- **Supabase PostgreSQL** 사용 (이미 연동됨)
- **Prisma ORM** 사용하여 타입 안전성 확보
- 마이그레이션 전략: Prisma Migrate 사용

### AI & LLM 파이프라인
- **Claude API** (Anthropic) 사용하여 에이전트 응답 생성
- **Vercel AI SDK** (`ai` 패키지) 또는 **Anthropic SDK** 직접 사용
- 요청 타임아웃: 30초 (필요시 조정)
- 토큰 계산: 입력 + 출력 토큰 기반 크레딧 차감

### 실시간 통신
- **SSE (Server-Sent Events)** 사용하여 에이전트 응답 스트리밍
- Next.js API Routes에서 `ReadableStream` 활용
- 클라이언트에서 `EventSource` API 사용하여 수신

### 인증 & 세션
- **Supabase Auth** (이미 연동됨) + JWT 세션
- Next.js Middleware로 보호된 라우트 관리
- 환경변수: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` 등

### 상태 관리
- **React Query** (@tanstack/react-query) 또는 **Zustand**: 서버 데이터 페칭 & 캐싱
- 로컬 상태: React `useState` 또는 **Zustand** 스토어

### 성능 & 최적화
- 메시지 페이지네이션 (무한 스크롤)
- 이미지 최적화 (`next/image`)
- 라우트별 코드 스플리팅
- 메시지 렌더링 가상화 (100개 이상 메시지 시)

### 보안
- CORS 설정 (Supabase 자동 처리)
- API 레이트 리미팅 (향후 구현)
- 사용자 권한 검증 (모든 엔드포인트에서)
- 환경변수 보안 (`.env.local` 미사용, Vercel Secrets 권장)

---

## 8. 성공 지표 (Success Metrics)

- **기술적**: 모든 Phase 1 스토리 구현 완료, 타입체크 & 린트 100% 통과
- **사용성**: 사용자가 로그인 후 5초 안에 첫 메시지 전송 가능
- **성능**: 메시지 조회 API 응답 시간 < 200ms, SSE 스트리밍 지연 < 1초
- **신뢰성**: 에이전트 API 호출 성공률 > 99%
- **테스트**: 주요 플로우 E2E 테스트 > 80% 커버리지

---

## 9. 미해결 질문 (Open Questions)

- Q1: 초기 크레딧 설정 (FREE 플랜 시 500? 1000? 무제한?)
- Q2: 에이전트별 비용 차등화 (PM > Dev > Designer 순으로?)
- Q3: 메시지 영구 보관 vs. 30일 보관 후 삭제?
- Q4: 칸반 태스크의 상세 설명 필드 포맷 (마크다운? 리치 텍스트?)
- Q5: 에이전트 응답 시 컨텍스트 윈도우 크기 (최근 메시지 10개? 20개?)
- Q6: 워크스페이스 공유/팀 협업은 Phase 4 이후 고려?

---

# TRD: AI-Chat-Service 기술 스택

## 1. 플랫폼

**Web App** (Next.js 기반, 브라우저 접근)

---

## 2. 기술 스택

### Frontend
- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript 5.x
- **UI Framework**: React 19.2.3
- **Styling**: Tailwind CSS 4.x
- **UI Components**: shadcn/ui, Lucide React (아이콘)
- **Markdown Rendering**: react-markdown + remark-gfm
- **Rich Text Editor**: Tiptap (설명 필드 등)
- **Animations**: Framer Motion 12.x
- **Form Validation**: (필요시 React Hook Form + Zod)
- **State Management**: Zustand 또는 React Query

### Backend
- **Framework**: Next.js 16.1.6 (API Routes)
- **Language**: TypeScript 5.x
- **ORM**: Prisma 5.x (PostgreSQL)
- **Authentication**: Supabase Auth (Google, Github OAuth)
- **Database**: PostgreSQL (Supabase)

### External Services
- **AI/LLM**: Claude API (Anthropic) - 메시지 생성
- **Streaming**: SSE (Server-Sent Events) - 실시간 응답
- **File Storage**: Supabase Storage (향후)

### Infrastructure & Deployment
- **Hosting**: Vercel (Next.js 최적화)
- **Database Hosting**: Supabase (PostgreSQL)
- **Environment Management**: Vercel Environment Variables
- **Version Control**: Git (GitHub)

### Development Tools
- **Package Manager**: npm
- **Linter**: ESLint
- **Formatter**: Prettier (설정 필요)
- **Testing**: Vitest (향후) 또는 Jest

---

## 3. 품질 검사 (Quality Checks)

```
build: "next build"
typecheck: "tsc --noEmit"
lint: "eslint ."
dev: "next dev"
```

- **빌드 성공**: `next build` 완료 (모든 타입 에러 제거)
- **타입체크**: `tsc --noEmit` 0개 에러
- **린트**: `eslint .` 0개 에러
- **개발 서버**: `next dev` 실행 후 브라우저에서 확인

---

## 4. 프로젝트 구조 (Project Structure)

```
ai-chat-service/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── auth/
│   │   │       └── callback/
│   │   │           └── route.ts
│   │   ├── (dashboard)/
│   │   │   ├── chat/
│   │   │   │   └── page.tsx
│   │   │   ├── agents/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── logout/
│   │   │   │   │   └── route.ts
│   │   │   │   └── callback/
│   │   │   │       └── route.ts
│   │   │   ├── workspaces/
│   │   │   │   └── route.ts
│   │   │   ├── chats/
│   │   │   │   └── [workspaceId]/
│   │   │   │       ├── route.ts (GET 과거 메시지)
│   │   │   │       └── message/
│   │   │   │           └── route.ts (POST 메시지 + AI 응답 SSE)
│   │   │   ├── agents/
│   │   │   │   └── active/
│   │   │   │       └── route.ts
│   │   │   ├── tasks/
│   │   │   │   ├── route.ts (GET)
│   │   │   │   └── webhook/
│   │   │   │       └── route.ts (POST)
│   │   │   ├── user/
│   │   │   │   ├── profile/
│   │   │   │   │   └── route.ts
│   │   │   │   └── credits/
│   │   │   │       └── history/
│   │   │   │           └── route.ts
│   │   │   └── billing/
│   │   │       ├── checkout/
│   │   │       │   └── route.ts
│   │   │       └── webhook/
│   │   │           └── route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx (홈 또는 리다이렉트)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── ActivityBar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── MainEditor.tsx
│   │   │   ├── StatusBar.tsx
│   │   │   └── MainLayout.tsx
│   │   ├── chat/
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   ├── Message.tsx
│   │   │   ├── AgentSelector.tsx
│   │   │   └── MessageList.tsx
│   │   ├── kanban/
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   └── TaskModal.tsx
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ... (shadcn/ui)
│   │   └── common/
│   │       ├── LoadingSpinner.tsx
│   │       └── ErrorBoundary.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   ├── api/
│   │   │   ├── workspaces.ts
│   │   │   ├── messages.ts
│   │   │   ├── agents.ts
│   │   │   ├── tasks.ts
│   │   │   └── user.ts
│   │   ├── ai/
│   │   │   ├── claude.ts (Claude API 호출)
│   │   │   ├── prompts.ts (system_prompt 정의)
│   │   │   └── streaming.ts (SSE 유틸)
│   │   ├── db/
│   │   │   ├── prisma.ts (Prisma 클라이언트)
│   │   │   └── queries.ts (주요 쿼리)
│   │   ├── auth/
│   │   │   └── session.ts
│   │   └── utils.ts
│   ├── types/
│   │   ├── index.ts
│   │   ├── database.ts (타입 정의)
│   │   └── api.ts (API 응답 타입)
│   ├── styles/
│   │   ├── globals.css
│   │   └── variables.css
│   ├── middleware.ts
│   └── env.ts (환경변수 검증)
├── prisma/
│   ├── schema.prisma (데이터베이스 스키마)
│   └── migrations/ (마이그레이션 파일)
├── public/
├── .env.local (로컬 개발용)
├── .env.example (템플릿)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

---

## 5. 데이터베이스 스키마 (Prisma Schema)

```prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// 사용자 테이블
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  name              String?
  avatarUrl         String?
  subscriptionTier  String    @default("FREE") // FREE, PRO, ENTERPRISE
  credits           Int       @default(0)
  createdAt         DateTime  @default(now())

  workspaces        Workspace[]

  @@map("users")
}

// 워크스페이스 (프로젝트) 테이블
model Workspace {
  id                String    @id @default(cuid())
  ownerId           String
  owner             User      @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  projectName       String
  status            String    @default("ACTIVE") // ACTIVE, ARCHIVED
  createdAt         DateTime  @default(now())

  chats             Chat[]
  tasks             Task[]

  @@map("workspaces")
}

// 에이전트 테이블 (시스템 기본 제공)
model Agent {
  id                String    @id @default(cuid())
  name              String
  role              String    // PM, DESIGNER, FRONTEND, BACKEND, QA, DATA
  systemPrompt      String    @db.Text
  hourlyRate        Int       @default(10) // 크레딧 비용

  messages          Message[]
  tasks             Task[]

  @@map("agents")
}

// 채팅 세션 테이블
model Chat {
  id                String    @id @default(cuid())
  workspaceId       String
  workspace         Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  title             String?
  createdAt         DateTime  @default(now())

  messages          Message[]

  @@map("chats")
}

// 메시지 테이블
model Message {
  id                String    @id @default(cuid())
  chatId            String
  chat              Chat      @relation(fields: [chatId], references: [id], onDelete: Cascade)
  senderType        String    // USER, AGENT, SYSTEM
  senderId          String?   // user.id or agent.id
  content           String    @db.Text // 마크다운 포함
  createdAt         DateTime  @default(now())

  agent             Agent?    @relation(fields: [senderId], references: [id], onDelete: SetNull)

  @@map("messages")
}

// 칸반 태스크 테이블
model Task {
  id                String    @id @default(cuid())
  workspaceId       String
  workspace         Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  assigneeId        String?
  assignee          Agent?    @relation(fields: [assigneeId], references: [id], onDelete: SetNull)
  title             String
  description       String?   @db.Text
  status            String    @default("TODO") // TODO, IN_PROGRESS, IN_REVIEW, DONE
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@map("tasks")
}
```

---

## 6. 환경 변수 (Environment Variables)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxx...
DATABASE_URL=postgresql://user:password@localhost:5432/ai_chat_service

# Claude API
ANTHROPIC_API_KEY=sk-ant-xxx...

# Stripe (향후)
STRIPE_SECRET_KEY=sk_live_xxx...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx...

# 앱 설정
NEXT_PUBLIC_APP_URL=https://localhost:3000
NODE_ENV=development
```

---

## 7. API 엔드포인트 요약

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/auth/callback` | OAuth 콜백, 사용자 생성/로그인 |
| POST | `/api/auth/logout` | 로그아웃 |
| GET | `/api/workspaces` | 사용자 워크스페이스 목록 |
| POST | `/api/workspaces` | 새 워크스페이스 생성 |
| GET | `/api/chats/[workspaceId]` | 과거 메시지 조회 (페이지네이션) |
| POST | `/api/chats/[workspaceId]/message` | 메시지 전송 + AI 응답 (SSE) |
| GET | `/api/agents/active` | 현재 활동 중인 에이전트 |
| GET | `/api/tasks?workspace_id=xxx` | 칸반 태스크 조회 |
| POST | `/api/tasks/webhook` | 자동 태스크 생성 (내부) |
| GET | `/api/user/profile` | 사용자 프로필 |
| PUT | `/api/user/profile` | 프로필 수정 |
| GET | `/api/user/credits/history` | 크레딧 사용 내역 |
| POST | `/api/billing/checkout` | 결제 체크아웃 (향후) |
| POST | `/api/billing/webhook` | 결제 웹훅 (향후) |

---

## 8. 개발 로드맵

### Phase 1: 인증 & 기본 설정 (1-2주)
- [ ] Supabase Auth 연동 (Google, Github)
- [ ] Next.js Middleware 권한 관리
- [ ] 기본 워크스페이스 자동 생성
- [ ] 로그아웃 기능

### Phase 2: 채팅 & AI 응답 (2-3주)
- [ ] 워크스페이스 CRUD
- [ ] 메시지 입력/저장/조회
- [ ] Claude API 연동 + SSE 스트리밍
- [ ] 에이전트 선택 UI
- [ ] 마크다운 렌더링

### Phase 3: 칸반 보드 (1-2주)
- [ ] 칸반 보드 UI
- [ ] 태스크 CRUD
- [ ] 드래그앤드롭
- [ ] 자동 태스크 생성 (webhook)

### Phase 4: 설정 & 결제 (1주)
- [ ] 사용자 프로필 페이지
- [ ] 크레딧 관리 UI
- [ ] Stripe 연동 구조 (아직 활성화 안 함)

---

## 9. 배포 체크리스트

- [ ] 환경변수 모두 설정 (Vercel Secrets)
- [ ] Prisma 마이그레이션 실행 (`prisma migrate deploy`)
- [ ] Supabase Auth 프로덕션 설정
- [ ] Claude API 프로덕션 키 설정
- [ ] `next build` 성공 확인
- [ ] 배포 전 스테이징 환경 테스트
- [ ] 에러 모니터링 설정 (Sentry 등)

---

**마지막 업데이트**: 2026-02-26
**작성자**: Claude Code
