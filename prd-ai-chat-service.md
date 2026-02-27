# PRD: AI-Chat-Service (AI Agent Collaboration Platform)

## 1. Project Overview
- **Project Name:** AI-Chat-Service
- **Goal:** Slack과 유사한 협업 경험을 제공하되, **VS Code(IDE) 스타일의 디자인**을 채택하여 개발자 친화적이고 전문적인 느낌을 주는 AI Agent 협업 플랫폼 구축. 사용자는 여러 AI Agent를 관리하고 한 채널에서 프로젝트를 지휘함.
- **Key Value:** "코드베이스 느낌의 전문적인 AI 팀 지휘소"

## 2. Core Features (MVP)
### 2.1 Slack-style UI/UX
- **Multi-channel support:** 프로젝트별, 직군별 채널 생성 가능.
- **Threaded conversations:** 특정 작업에 대한 심도 있는 논의를 위한 쓰레드 기능.
- **Rich Messaging:** 코드 블록, 이미지, 파일 업로드 UI.

### 2.2 Dynamic Agent Management
- **Agent Roles:** PM(James), Designer, Developer, Marketer 등을 기본 제공하며, 사용자가 에이전트를 추가/삭제/수정할 수 있는 UI.
- **Agent Status Reporting:** 각 에이전트가 현재 수행 중인 작업(Task)과 진행률(%)을 VS Code의 'Output' 또는 'Terminal' 탭 느낌으로 시각화.
- **Collaboration Flow:** 에이전트 간의 업무 인계 과정이 코드 리뷰나 로그 형태의 UI로 노출.

### 2.3 Dashboard Elements
- 채널별 전체 진행 상황 요약 위젯.
- 주요 마일스톤 및 마감 기한 표시.

## 3. Design Considerations: VS Code Style
- **Color Palette:** VS Code Default Dark (Dark Gray/Black), Syntax Highlighting 색채 (Blue, Orange, Green, Purple)를 포인트 컬러로 사용.
- **Layout:** 
    - Left Activity Bar (Icons for Search, Agents, Settings)
    - Sidebar (Channel List, Agent List)
    - Main Editor Area (Chat Messages)
    - Bottom Panel (Status, Tasks, Agent Outputs)
- **Identity:** '협업 도구'와 '코드 편집기'의 장점을 결합한 세련되고 절제된 디자인.
- **Responsiveness:** 다양한 화면 크기에서도 IDE의 구조적 안정성을 유지.

## 4. Technical Stack (UI Focus)
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui, Lucide React (Icons)
- **Animations:** Framer Motion

## 5. User Stories
- **대표님은** 새로운 채널을 개설하고 AI 에이전트팀을 초대하여 프로젝트를 시작할 수 있다.
- **PM James는** 전체 프로젝트 로드맵을 채널에 브리핑하고 에이전트들에게 업무를 할당하는 UI를 보여준다.
- **디자이너/개발자는** 결과물(디자인 시안, 코드 스니펫)을 채팅 창에 공유하고 대표님의 피드백을 기다리는 상태를 보여준다.

## 6. Open Questions
- 에이전트들과의 실제 연동(Back-end)은 추후 단계에서 고려할지, 아니면 API 인터페이스만 미리 설계해둘지? (현재는 UI/UX에 집중)
- 실시간 알림 UI는 어떻게 구성할 것인가?
