"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Plus, User, Bot } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// TerminalBackground 컴포넌트 (랜딩페이지와 동일한 애니메이션)
const TerminalBackground = () => {
  type ChatLog = { id: string, name: string, time: string, role: string, roleColor: string, message: string, isUser?: boolean };
  const [chatLogs, setChatLogs] = useState<ChatLog[]>([]);
  const [codeText, setCodeText] = useState("");

  useEffect(() => {
    // 코드 타이핑 애니메이션
    const rawCode = `import { Agent, Workspace } from '@ai-team/core';

const team = new Workspace({
  id: 'vibe-runner-mvp',
  parallelExecution: true,
});

team.addAgent(new Agent('UX_Researcher', { model: 'gpt-4o' }));
team.addAgent(new Agent('Backend_Dev', { model: 'claude-3.5-sonnet' }));

team.on('task_complete', (res) => {
  console.log('Dependencies resolved');
  team.notifyUser('Approval required');
});

// Executing parallel pipelines
team.execute('Design and build landing page');`;

    let i = 0;
    const codeInterval = setInterval(() => {
      setCodeText(rawCode.slice(0, i));
      i += (Math.floor(Math.random() * 3) + 1);
      if (i > rawCode.length + 50) i = 0;
    }, 40);

    // 채팅 로그 애니메이션
    const messages: ChatLog[] = [
      { id: "1", name: "Ash (CEO)", time: "10:00 AM", role: "CEO", roleColor: "#cccccc", message: "메인 랜딩페이지 기획안대로 개발 진행해주세요. VS Code 테마로 부탁합니다.", isUser: true },
      { id: "2", name: "James (PM)", time: "10:01 AM", role: "PM", roleColor: "#007acc", message: "요청 확인했습니다. 즉시 작업 진행하겠습니다.\nSarah, 기획 문서 기반으로 UI 시안 작업 부탁해요." },
      { id: "3", name: "Sarah (Designer)", time: "10:01 AM", role: "DESIGNER", roleColor: "#ffbd2e", message: "시안 작업 착수합니다. 다크 모드 최적화 컬러 팔레트 #1e1e1e 적용 중..." },
      { id: "4", name: "Kevin (Dev)", time: "10:02 AM", role: "BACKEND", roleColor: "#27c93f", message: "프론트엔드 작업과 병렬로 DB 스키마 및 Next.js 라우트 세팅 시작합니다." },
      { id: "5", name: "Sarah (Designer)", time: "10:03 AM", role: "DESIGNER", roleColor: "#ffbd2e", message: "UI 컴포넌트 디자인 완료. Asset 스토어로 전달했습니다." },
      { id: "6", name: "Kevin (Dev)", time: "10:04 AM", role: "BACKEND", roleColor: "#27c93f", message: "API 연동 테스트 통과 (0 Errors). 렌더링 파이프라인 정상 연결되었습니다." },
      { id: "7", name: "James (PM)", time: "10:05 AM", role: "PM", roleColor: "#007acc", message: "랜딩페이지 1차 빌드 완료되었습니다! 우측 대시보드 뷰에서 [Approve] 해주시면 배포됩니다." }
    ];

    let j = 0;
    setChatLogs([]);
    let isResetting = false;

    const chatInterval = setInterval(() => {
      if (isResetting) return;

      if (j < messages.length) {
        setChatLogs((prev) => [...prev, messages[j]]);
        j++;
      } else {
        isResetting = true;
        setTimeout(() => {
          setChatLogs([]);
          j = 0;
          isResetting = false;
        }, 6000);
      }
    }, 1800);

    return () => {
      clearInterval(codeInterval);
      clearInterval(chatInterval);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none opacity-[0.35] z-0 hidden md:flex justify-center">
      <div className="w-full max-w-7xl mx-auto h-full px-6 flex pt-[8rem] pb-8 relative">
        {/* 왼쪽 채팅 영역 */}
        <div className="w-[500px] border-r border-[#333]/50 pr-12 flex flex-col justify-start relative pt-8">
          <div className="flex flex-col gap-6 w-full">
            <AnimatePresence>
              {chatLogs.filter(Boolean).map((log, idx) => (
                <motion.div
                  key={`${log.id}-${idx}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="flex gap-3"
                >
                  <div className="w-6 h-6 rounded bg-[#252526] border border-[#333] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    {log.isUser ? <User size={12} className="text-[#cccccc]" /> : <Bot size={12} style={{ color: log.roleColor }} />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-[12px]">{log.name}</span>
                      <span className="text-[9px] text-[#858585]">{log.time}</span>
                      {!log.isUser && (
                        <span className="px-1 py-0.5 rounded text-[8px] font-bold bg-[#333] tracking-widest" style={{ color: log.roleColor }}>
                          {log.role}
                        </span>
                      )}
                    </div>
                    <div className="text-[12px] leading-relaxed text-[#cccccc] font-sans whitespace-pre-wrap">
                      {log.message}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* 오른쪽 코드 에디터 영역 */}
        <div className="flex-1 pl-12 flex flex-col justify-start overflow-hidden pt-8">
          <div className="text-[13px] md:text-[14px] text-[#cccccc] font-mono whitespace-pre-wrap leading-relaxed opacity-60">
            {codeText}<span className="animate-pulse bg-[#007acc] w-2 h-[15px] inline-block align-middle ml-1" />
          </div>
        </div>
      </div>
      {/* 하단 페이드 */}
      <div className="absolute inset-x-0 bottom-0 h-[25vh] bg-gradient-to-t from-[#1e1e1e] to-transparent z-10" />
    </div>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  async function handleAddWorkspace(e: React.FormEvent) {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_name: newWorkspaceName.trim() }),
      });

      const result = await response.json();
      if (result.success) {
        const newWorkspace = result.data.workspace;
        setNewWorkspaceName("");
        setShowAddModal(false);

        // 새 워크스페이스로 이동
        router.push(`/dashboard/${newWorkspace.id}`);
      }
    } catch (error) {
      console.error("워크스페이스 생성 실패:", error);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center h-full bg-[var(--vscode-editor)] overflow-hidden">
      {/* 배경 애니메이션 */}
      <TerminalBackground />

      {/* 중앙 콘텐츠 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center space-y-6 px-6 max-w-md"
      >
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-white">새로운 프로젝트 시작</h2>
          <p className="text-[#858585] text-lg">
            채널을 생성하여 AI 팀과 함께 프로젝트를 시작해보세요
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-[#007acc] hover:bg-[#0062a3] text-white rounded font-bold transition-colors mx-auto"
        >
          <Plus size={20} />
          채널 생성하기
        </motion.button>
      </motion.div>

      {/* Add Channel Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#252526] border border-[#333] rounded-lg p-6 w-full max-w-sm mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">채널 생성</h3>
            <form onSubmit={handleAddWorkspace} className="space-y-4">
              <input
                type="text"
                placeholder="채널명을 입력하세요"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#333] rounded text-[#cccccc] placeholder-[#666] focus:border-[#007acc] focus:outline-none transition-colors text-[13px]"
              />
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewWorkspaceName("");
                  }}
                  className="px-3 py-1.5 text-[#858585] hover:text-white border border-[#333] rounded hover:border-[#555] transition-colors text-[12px] font-bold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-1.5 bg-[#007acc] hover:bg-[#0062a3] disabled:opacity-50 text-white rounded text-[12px] font-bold transition-colors"
                >
                  {isCreating ? "생성 중..." : "생성"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
