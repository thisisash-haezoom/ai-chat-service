# AI Chat Service - 프로젝트 규칙

> 이 파일은 ai-chat-service 프로젝트 전용 규칙입니다.
> 전역 규칙은 `~/.claude/CLAUDE.md` 참고

## 🎯 프로젝트 개요
**AI Team Mate**: 1인 창업가를 위한 전문화된 AI 팀 빌딩 플랫폼
- VS Code 테마 기반 UI/UX
- 워크스페이스 기반 AI 에이전트 협업
- 실시간 채팅 인터페이스

---

## 📐 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React + Framer Motion
- **Editor**: TipTap (리치 텍스트)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State**: React Hooks + Supabase

### Backend
- **Auth**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **AI API**: Anthropic Claude API
- **Streaming**: Server-Sent Events (SSE)

### Dev Tools
- **Language**: TypeScript
- **Package Manager**: npm
- **Code Style**: ESLint (기본 Next.js)

---

## 📁 프로젝트 구조

```
ai-chat-service/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # 루트 레이아웃
│   │   ├── page.tsx                      # 랜딩페이지
│   │   ├── login/                        # 인증
│   │   ├── dashboard/                    # 메인 대시보드
│   │   │   ├── page.tsx                  # 빈 상태 화면
│   │   │   └── [workspaceId]/
│   │   │       └── page.tsx              # 채팅 인터페이스
│   │   ├── chat/                         # 레거시 (유지용)
│   │   │   └── [workspaceId]/page.tsx
│   │   └── api/
│   │       ├── auth/
│   │       ├── workspaces/               # 워크스페이스 CRUD
│   │       └── chats/                    # 메시지 CRUD + Claude API
│   ├── components/
│   │   ├── layout/
│   │   │   ├── MainLayout.tsx            # 메인 레이아웃 (Sidebar + Editor)
│   │   │   ├── Sidebar.tsx               # 사이드바 (워크스페이스 목록)
│   │   │   ├── ActivityBar.tsx           # 좌측 활동 바
│   │   │   └── StatusBar.tsx             # 하단 상태 바
│   │   └── chat/
│   │       └── ChatEditor.tsx            # 메시지 입력 (TipTap 기반)
│   ├── utils/
│   │   └── supabase/                     # Supabase 클라이언트
│   └── lib/
│       └── utils.ts                      # 유틸리티 함수
├── wip/                                  # 작업 일지
│   ├── WIP_RULES.md
│   └── YYYY-MM-DD.md
└── CLAUDE.md                             # 이 파일
```

---

## 🚀 핵심 기능 및 파일

### 1. 워크스페이스 관리
| 기능 | 파일 | 설명 |
|------|------|------|
| 워크스페이스 생성 | `/api/workspaces` POST | 새 프로젝트 생성 + chat 세션 자동 생성 |
| 워크스페이스 조회 | `/api/workspaces` GET | 사용자의 모든 워크스페이스 목록 |
| 동적 채널 표시 | `src/components/layout/Sidebar.tsx` | DB 기반 실시간 워크스페이스 목록 |

### 2. 채팅 인터페이스
| 기능 | 파일 | 설명 |
|------|------|------|
| 메시지 입력 | `src/components/chat/ChatEditor.tsx` | TipTap 기반 리치 텍스트 에디터 |
| 메시지 조회 | `/api/chats/[workspaceId]` GET | 페이지네이션 지원 |
| 메시지 전송 | `/api/chats/[workspaceId]/message` POST | Claude API 호출 + SSE 스트리밍 |

### 3. UI/UX
| 요소 | 파일 | 설명 |
|------|------|------|
| 대시보드 기본 화면 | `src/app/dashboard/page.tsx` | 빈 상태 + 애니메이션 배경 |
| 채팅 페이지 | `src/app/dashboard/[workspaceId]/page.tsx` | 메인 채팅 인터페이스 |
| 메인 레이아웃 | `src/components/layout/MainLayout.tsx` | VS Code 스타일 레이아웃 |

---

## 📋 작업 규칙

### 1. 작업 일지 (매일 필수)
- **위치**: `/wip/YYYY-MM-DD.md`
- **작성 시점**: 매일 작업 마무리 시
- **필수 섹션**:
  - ✅ 완료 작업
  - 🔧 트러블슈팅
  - 🚀 업데이트된 기능
  - 📌 주요 통계
  - 🔗 참고 링크

### 2. 커밋 메시지
```
feat: [기능명] - 간단한 설명
fix: [버그명] - 문제 해결
refactor: [변경명] - 코드 개선
docs: [문서명] - 문서 추가/수정
```

### 3. 코드 스타일
- **들여쓰기**: 2칸 (Tailwind 클래스도 정렬)
- **언어**:
  - 주석 & 변수: 한국어
  - 함수명/파일명: 영어
  - 커밋 메시지: 한국어
- **타입스크립트**: 항상 타입 정의

### 4. 작업 플로우
```
1. 작업 시작 → TaskCreate로 task 생성
2. 작업 진행 → TaskUpdate로 in_progress 표시
3. 작업 완료 → TaskUpdate로 completed 표시
4. 일지 작성 → /wip/YYYY-MM-DD.md 업데이트
5. 커밋 → git commit -m "..." (한국어 메시지)
```

---

## 🔌 API 엔드포인트

### 워크스페이스
```
GET  /api/workspaces                 # 목록 조회
POST /api/workspaces                 # 생성 (chat 자동 생성)
```

### 채팅
```
GET  /api/chats/[workspaceId]        # 메시지 조회 (?limit=50&offset=0)
POST /api/chats/[workspaceId]/message # 메시지 전송 (SSE 스트리밍)
```

### 인증
```
POST /api/auth/logout                # 로그아웃
```

---

## 🎨 UI/UX 가이드

### 색상 팔레트 (VS Code 테마)
| 용도 | 색상 | CSS |
|------|------|-----|
| 배경 | `#1e1e1e` | `bg-[#1e1e1e]` |
| 에디터 | `#252526` | `bg-[#252526]` |
| 텍스트 | `#cccccc` | `text-[#cccccc]` |
| 강조 (Primary) | `#007acc` | `text-[#007acc]` |
| 보더 | `#333` | `border-[#333]` |
| 호버 | `#37373d` | `hover:bg-[#37373d]` |

### 에이전트 색상
```javascript
PM: '#007acc'          // 파란색
DESIGNER: '#ffbd2e'    // 노란색
FRONTEND: '#4bb3fd'    // 밝은 파란색
BACKEND: '#27c93f'     // 초록색
QA: '#e36209'          // 주황색
DATA: '#c586c0'        // 보라색
```

### 애니메이션
- **Framer Motion** 사용
- 부드러운 fade/slide 전환
- SSE 스트리밍: 단어 단위 타이핑 효과

---

## 🐛 주요 고려사항

### 1. 데이터 흐름
```
Sidebar → 워크스페이스 조회 (useEffect)
       ↓
클릭 → /dashboard/[workspaceId]
       ↓
ChatEditor → 메시지 입력 (텍스트만)
          ↓
API (/api/chats/message) → Claude API
                        ↓
SSE 스트리밍 → 메시지 렌더링 → DB 저장
```

### 2. 중요한 패턴
- **ChatEditor**: 입력값은 **텍스트** (HTML X)
- **워크스페이스**: 생성 시 chat 세션 **자동 생성**
- **메시지 전송**: useParams로 workspaceId 추출
- **인증**: 매 API 호출마다 사용자 확인

### 3. 타입 정의
```typescript
// 워크스페이스
interface Workspace {
  id: string;
  project_name: string;
  created_at: string;
}

// 메시지
interface Message {
  id: string;
  sender_type: 'USER' | 'AGENT';
  sender_id?: string;
  content: string;
  created_at: string;
  senderName?: string;
  senderRole?: string;
  senderColor?: string;
}
```

---

## 📊 진행 상황

### 완료된 기능
- ✅ 워크스페이스 생성 & 조회
- ✅ 동적 채널 시스템 (Sidebar)
- ✅ 대시보드 기본 화면
- ✅ 채팅 인터페이스
- ✅ 메시지 전송/수신
- ✅ Claude API 연동
- ✅ SSE 스트리밍

### 진행 중
- ⚠️ 실제 테스트 및 버그 수정

### 예정 작업
- ❌ 메시지 페이지네이션 (무한 스크롤)
- ❌ 에이전트 선택 기능
- ❌ 워크스페이스 삭제/편집
- ❌ 사용자 프로필
- ❌ 크레딧 시스템

---

## 🔗 참고 자료

### 문서
- `/wip/WIP_RULES.md` - 작업 일지 작성 가이드
- `/wip/YYYY-MM-DD.md` - 일일 작업 기록
- `~/.claude/CLAUDE.md` - 전역 규칙

### 중요 커밋/PR
- 초기 구조 구축
- 대시보드 재구성 (워크스페이스 동적 로드)
- 채팅 기능 구현 (텍스트 기반 전송)

---

## 💡 팁

### 개발할 때
1. **타입 먼저** - interface 정의 후 구현
2. **API 확인** - Supabase 테이블 스키마 확인
3. **테스트** - 로그인 → 워크스페이스 생성 → 채팅
4. **스타일** - Tailwind 클래스 (기존 색상 재사용)

### 트러블슈팅할 때
1. 브라우저 콘솔에서 에러 확인
2. 네트워크 탭에서 API 응답 확인
3. Supabase 대시보드에서 데이터 확인
4. `/wip` 일지에서 이전 해결책 찾기

---

**마지막 업데이트**: 2026-02-27
