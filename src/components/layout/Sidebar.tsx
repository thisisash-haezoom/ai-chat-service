"use client";

import { ChevronDown, ChevronRight, Hash, MessageCircle, Bot, Plus, X, PanelLeftClose, PanelLeftOpen, MoreVertical, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function SidebarSection({ title, isOpen, onToggle, children }: SidebarSectionProps) {
  return (
    <div className="mb-2">
      <button
        onClick={onToggle}
        className="w-full flex items-center px-1 py-1 text-[11px] font-bold uppercase text-[#858585] hover:bg-[#37373d] transition-colors"
      >
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span className="ml-1 tracking-wider">{title}</span>
      </button>
      {isOpen && <div className="mt-1">{children}</div>}
    </div>
  );
}

interface Workspace {
  id: string;
  project_name: string;
}

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();

  const [channelsOpen, setChannelsOpen] = useState(true);
  const [agentsOpen, setAgentsOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 워크스페이스 관련 상태
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 워크스페이스 목록 로드
  useEffect(() => {
    loadWorkspaces();
  }, []);

  async function loadWorkspaces() {
    try {
      setLoadingWorkspaces(true);
      const response = await fetch("/api/workspaces");
      const result = await response.json();
      if (result.success) {
        setWorkspaces(result.data.workspaces || []);
      }
    } catch (error) {
      console.error("워크스페이스 로드 실패:", error);
    } finally {
      setLoadingWorkspaces(false);
    }
  }

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
        setWorkspaces([newWorkspace, ...workspaces]);
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

  async function handleDeleteWorkspace(workspaceId: string) {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/workspaces?id=${workspaceId}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (result.success) {
        setWorkspaces(workspaces.filter((w) => w.id !== workspaceId));
        setDeleteConfirm(null);

        // 삭제된 워크스페이스가 현재 보고 있는 것이면 대시보드로 이동
        if (currentWorkspaceId === workspaceId) {
          router.push("/dashboard");
        }
      } else {
        alert("삭제 실패: " + result.error);
      }
    } catch (error) {
      console.error("워크스페이스 삭제 실패:", error);
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  }

  // 현재 선택된 워크스페이스 ID 추출 (pathname에서)
  const isWorkspacePath = pathname.startsWith("/dashboard/");
  const currentWorkspaceId = isWorkspacePath
    ? pathname.split("/")[2]
    : null;

  if (isCollapsed) {
    return (
      <div className="w-[48px] h-full bg-[var(--vscode-sidebar)] flex flex-col items-center justify-start border-r border-[var(--vscode-border)] select-none pt-4 transition-all duration-300">
        <button 
          onClick={() => setIsCollapsed(false)}
          className="p-1 hover:bg-[#37373d] rounded text-[#858585] hover:text-white transition-colors"
          title="Expand Sidebar"
        >
          <PanelLeftOpen size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-[260px] h-full bg-[var(--vscode-sidebar)] flex flex-col border-r border-[var(--vscode-border)] select-none shadow-2xl md:shadow-none transition-all duration-300">
      <div className="h-12 md:h-9 flex items-center justify-between px-4 text-[11px] text-[#858585] font-semibold uppercase tracking-wider border-b border-[#333] md:border-none">
        <span>Explorer</span>
        <div className="flex gap-1">
          <button 
            onClick={() => setIsCollapsed(true)} 
            className="hidden md:flex p-1 hover:bg-[#37373d] rounded text-[#858585] hover:text-white transition-colors"
            title="Collapse Sidebar"
          >
            <PanelLeftClose size={16} />
          </button>
          {onClose && (
            <button onClick={onClose} className="md:hidden p-1 hover:bg-[#37373d] rounded text-white transition-colors">
              <X size={16} />
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto pt-2">
        <SidebarSection
          title="Channels"
          isOpen={channelsOpen}
          onToggle={() => setChannelsOpen(!channelsOpen)}
        >
          <div className="flex flex-col">
            {loadingWorkspaces ? (
              <div className="px-4 py-2 text-[12px] text-[#858585]">로딩 중...</div>
            ) : workspaces.length === 0 ? (
              <div className="px-4 py-2 text-[12px] text-[#858585]">채널이 없습니다</div>
            ) : (
              workspaces.map((workspace) => (
                <div
                  key={workspace.id}
                  className={cn(
                    "w-full flex items-center px-4 py-0.5 text-[13px] group transition-colors",
                    currentWorkspaceId === workspace.id
                      ? "bg-[#37373d] text-white"
                      : "text-[#cccccc] hover:bg-[#37373d]"
                  )}
                >
                  <button
                    onClick={() => router.push(`/dashboard/${workspace.id}`)}
                    className="flex-1 flex items-center text-left"
                  >
                    <Hash size={16} className="mr-1.5 text-[#858585]" />
                    <span>{workspace.project_name}</span>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(workspace.id)}
                    className="p-1 hover:bg-[#37373d] rounded text-[#858585] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    title="삭제"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full flex items-center px-4 py-1 text-[13px] text-[#858585] hover:bg-[#37373d] transition-colors"
            >
              <Plus size={14} className="mr-2" />
              <span>Add Channel</span>
            </button>
          </div>
        </SidebarSection>

        <SidebarSection 
          title="AI Agents" 
          isOpen={agentsOpen} 
          onToggle={() => setAgentsOpen(!agentsOpen)}
        >
          <div className="flex flex-col">
            {[
              { name: "James (PM)", status: "online" },
              { name: "Sarah (Designer)", status: "busy" },
              { name: "Kevin (Dev)", status: "online" },
              { name: "Mia (Marketer)", status: "offline" },
            ].map((agent) => (
              <button
                key={agent.name}
                className="w-full flex items-center px-4 py-0.5 text-[13px] text-[#cccccc] hover:bg-[#37373d] group transition-colors"
              >
                <Bot size={16} className="mr-1.5 text-[#858585]" />
                <span className="flex-1 text-left">{agent.name}</span>
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  agent.status === "online" ? "bg-green-500" : 
                  agent.status === "busy" ? "bg-red-500" : "bg-[#858585]"
                )} />
              </button>
            ))}
            <button className="w-full flex items-center px-4 py-1 text-[13px] text-[#858585] hover:bg-[#37373d] transition-colors">
              <Plus size={14} className="mr-2" />
              <span>Manage Agents</span>
            </button>
          </div>
        </SidebarSection>
      </div>

      {/* Add Channel Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
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

      {/* Delete Workspace Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-[#252526] border border-[#333] rounded-lg p-6 w-full max-w-sm mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">채널 삭제</h3>
            <p className="text-[13px] text-[#cccccc] mb-6">
              정말 이 채널을 삭제하시겠습니까? 모든 대화 기록이 삭제됩니다.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                className="px-3 py-1.5 text-[#858585] hover:text-white border border-[#333] rounded hover:border-[#555] transition-colors text-[12px] font-bold disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={() => handleDeleteWorkspace(deleteConfirm)}
                disabled={isDeleting}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded text-[12px] font-bold transition-colors"
              >
                {isDeleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

