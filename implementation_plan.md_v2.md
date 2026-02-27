# Implementation Plan: Phase 3 - Auth & Settings

## Goal
Implement a developer-centric Login page and a comprehensive Settings/My Page area to manage user profiles, API keys, and resource usage.

## Proposed Changes

### 1. Login Page (`/login`) [NEW]
- **Design:** Modern dark UI inspired by VS Code/GitHub login.
- **Features:** 
  - Google Login Button (Visual/Button component).
  - "Developer Login" branding.
  - Background: Monospace code snippet animation or static terminal-style text.

### 2. Settings Page (`/settings`) [NEW]
- **Design:** VS Code 'Settings' (JSON/UI) hybrid style. 
- **Sections:**
  - **Account:** User profile image, Name, Email.
  - **AI Providers:** Input fields for OpenAI, Anthropic, Google Gemini API Keys.
  - **Billing/Usage:** Monthly spend tracking, Token usage visualization (simple bars).
  - **Theme:** Sidebar/Activity bar color customization options.

### 3. Navigation Update
- Update `ActivityBar.tsx` to include the user profile icon at the bottom.
- Update `Sidebar.tsx` (optional) or use direct navigation via activity bar.

## Verification Plan
1. **UI Check:** Verify `/login` and `/settings` match the VS Code aesthetic.
2. **Navigation:** Ensure seamless transition from Activity Bar to Settings.
3. **Responsive:** Ensure Login page looks great on mobile/desktop.
