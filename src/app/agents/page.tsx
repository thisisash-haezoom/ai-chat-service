"use client";

import {
  Bot,
  Search,
  Settings,
  Plus,
  Star,
  Download,
  ShieldCheck,
  Cpu,
  Puzzle,
  ExternalLink,
  ChevronLeft,
  Info,
  Terminal
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

const ALL_AGENTS = [
  { 
    id: "james", 
    name: "James (PM)", 
    version: "v1.0.4", 
    author: "Antigravity", 
    description: "The veteran PM who manages your tasks and keeps the vibe alive.", 
    installed: true, 
    rating: 4.9, 
    downloads: "12k",
    specialty: "Project Management",
    tags: ["Planning", "Reporting"]
  },
  { 
    id: "sarah", 
    name: "Sarah (Designer)", 
    version: "v0.9.2", 
    author: "Antigravity", 
    description: "Expert in UI/UX and modern aesthetics. VS Code theme specialist.", 
    installed: true, 
    rating: 4.8, 
    downloads: "8.5k",
    specialty: "Design",
    tags: ["UI/UX", "Figma"]
  },
  { 
    id: "kevin", 
    name: "Kevin (Dev)", 
    version: "v2.1.0", 
    author: "Antigravity", 
    description: "Full-stack developer focused on performance and clean code.", 
    installed: true, 
    rating: 5.0, 
    downloads: "25k",
    specialty: "Development",
    tags: ["React", "TypeScript"]
  },
  { 
    id: "mia", 
    name: "Mia (Marketer)", 
    version: "v1.1.2", 
    author: "Antigravity", 
    description: "AI-driven marketing strategy and content generation expert.", 
    installed: false, 
    rating: 4.5, 
    downloads: "5k",
    specialty: "Marketing",
    tags: ["SEO", "Content"]
  },
  { 
    id: "leo", 
    name: "Leo (QA)", 
    version: "v0.5.0", 
    author: "Community", 
    description: "Automated testing and quality assurance for mission-critical apps.", 
    installed: false, 
    rating: 4.2, 
    downloads: "2k",
    specialty: "Testing",
    tags: ["TDD", "Cypress"]
  }
];

interface Agent {
  id: string;
  name: string;
  role: string;
  color: string;
  system_prompt: string;
  hourly_rate: number;
  version?: string;
  author?: string;
  description?: string;
  installed?: boolean;
  rating?: number;
  downloads?: string;
  specialty?: string;
  tags?: string[];
}

export default function AgentsPage() {
  const supabase = createClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [userWorkspaces, setUserWorkspaces] = useState<any[]>([]);
  const [installedAgents, setInstalledAgents] = useState<Set<string>>(new Set());
  const [installing, setInstalling] = useState<string | null>(null);

  // 에이전트 목록 로드
  useEffect(() => {
    loadAgents();
  }, []);

  async function loadAgents() {
    try {
      setLoading(true);

      // 1. 현재 사용자 정보 조회
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // 2. 사용자의 워크스페이스 조회
      const { data: workspaces } = await supabase
        .from('workspaces')
        .select('id')
        .eq('owner_id', user.id);

      if (workspaces) {
        setUserWorkspaces(workspaces);
      }

      // 3. 에이전트 목록 조회
      const { data: agentsData } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: true });

      if (agentsData && agentsData.length > 0) {
        const formattedAgents = agentsData.map((agent: any) => ({
          ...agent,
          version: agent.version || "v1.0.0",
          author: agent.author || "Antigravity",
          description: agent.description || `${agent.name} - AI Team Agent`,
          rating: agent.rating || 4.5,
          downloads: agent.downloads || "1k",
          specialty: agent.role || "General",
          tags: agent.tags || [agent.role || "AI"],
        }));
        setAgents(formattedAgents);
        setSelectedAgent(formattedAgents[0]);

        // 4. 설치된 에이전트 확인 (첫 번째 워크스페이스 기준)
        if (workspaces && workspaces.length > 0) {
          const response = await fetch(
            `/api/workspace-agents?workspaceId=${workspaces[0].id}`
          );
          const result = await response.json();

          if (result.success && result.data.agents) {
            const agentIds = result.data.agents.map((agent: any) => agent.id);
            setInstalledAgents(new Set(agentIds));
          }
        }
      }
    } catch (error) {
      console.error("에이전트 목록 로드 실패:", error);
      setAgents(ALL_AGENTS);
      setSelectedAgent(ALL_AGENTS[0]);
    } finally {
      setLoading(false);
    }
  }

  async function handleInstall(agentId: string) {
    if (!userWorkspaces || userWorkspaces.length === 0) {
      alert("워크스페이스가 없습니다");
      return;
    }

    setInstalling(agentId);
    try {
      const workspaceId = userWorkspaces[0].id;

      const response = await fetch("/api/workspace-agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          agentId,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "설치 실패");
      }

      setInstalledAgents((prev) => new Set([...prev, agentId]));
    } catch (error) {
      console.error("설치 실패:", error);
      alert(error instanceof Error ? error.message : "에이전트 설치에 실패했습니다");
    } finally {
      setInstalling(null);
    }
  }

  async function handleUninstall(agentId: string) {
    if (!userWorkspaces || userWorkspaces.length === 0) return;

    setInstalling(agentId);
    try {
      const workspaceId = userWorkspaces[0].id;

      const response = await fetch(
        `/api/workspace-agents?workspaceId=${workspaceId}&agentId=${agentId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "제거 실패");
      }

      setInstalledAgents((prev) => {
        const newSet = new Set(prev);
        newSet.delete(agentId);
        return newSet;
      });
    } catch (error) {
      console.error("제거 실패:", error);
      alert(error instanceof Error ? error.message : "에이전트 제거에 실패했습니다");
    } finally {
      setInstalling(null);
    }
  }

  const filteredAgents = agents.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#1e1e1e]">
        <div className="text-[#858585]">에이전트 로드 중...</div>
      </div>
    );
  }

  const displayAgent = selectedAgent || (agents.length > 0 ? agents[0] : null);

  return (
    <div className="flex flex-col md:flex-row h-full bg-[#1e1e1e] font-sans text-[#cccccc] overflow-hidden relative">
      {/* Search & List Sidebar */}
      <div className="w-full md:w-[350px] shrink-0 border-r border-[var(--vscode-border)] flex flex-col bg-[#252526] h-1/2 md:h-full z-10">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-[11px] font-bold uppercase tracking-wider text-[#858585]">Marketplace: Agents</h1>
            <button className="text-[#858585] hover:text-white transition-colors">
              <Plus size={16} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 text-[#858585]" size={14} />
            <input 
              type="text"
              placeholder="Search Agents in Marketplace"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#3c3c3c] border border-transparent focus:border-[#007acc] rounded-sm py-1.5 pl-8 pr-2 text-[12px] outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pt-2 scrollbar-thin scrollbar-thumb-[#333]">
          {filteredAgents.map((agent) => (
            <div 
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className={cn(
                "px-4 py-3 flex gap-3 cursor-pointer group transition-colors border-l-2",
                displayAgent?.id === agent.id 
                  ? "bg-[#37373d] border-[#007acc]" 
                  : "hover:bg-[#2a2d2e] border-transparent"
              )}
            >
              <div className="w-10 h-10 rounded bg-[#1e1e1e] border border-[var(--vscode-border)] flex items-center justify-center shrink-0">
                <Bot size={24} className={agent.installed ? "text-[#007acc]" : "text-[#858585]"} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="text-[13px] font-semibold truncate group-hover:text-blue-400">
                    {agent.name}
                  </h3>
                  {agent.installed && <ShieldCheck size={12} className="text-blue-500 mt-1" />}
                </div>
                <p className="text-[11px] text-[#858585] line-clamp-1 mt-0.5">{agent.description}</p>
                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#858585]">
                  <span className="flex items-center gap-0.5"><Star size={10} className="text-yellow-500 fill-yellow-500" /> {agent.rating}</span>
                  <span className="flex items-center gap-0.5"><Download size={10} /> {agent.downloads}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agent Detail View */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e] overflow-y-auto h-1/2 md:h-full">
        <header className="h-9 border-b border-[var(--vscode-border)] bg-[#252526] flex items-center px-4 justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2 text-[12px]">
             <span className="text-[#858585]">Extensions</span>
             <span className="text-[#858585]">/</span>
             <span>{displayAgent?.name}</span>
          </div>
          <div className="flex items-center gap-3">
             <button className="p-1 hover:bg-[#37373d] rounded transition-colors"><Settings size={14} /></button>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-4xl">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-10">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg bg-[#252526] border border-[var(--vscode-border)] flex items-center justify-center shrink-0 shadow-lg mx-auto md:mx-0">
              <Bot size={48} className={cn("md:w-16 md:h-16", displayAgent?.installed ? "text-[#007acc]" : "text-[#858585]")} />
            </div>
            <div className="flex-1 pt-2">
              <div className="flex items-center gap-4 mb-2">
                <h2 className="text-3xl font-bold text-white">{displayAgent?.name}</h2>
                <span className="text-[12px] px-2 py-0.5 bg-[#37373d] rounded-full text-[#cccccc]">{displayAgent?.version}</span>
              </div>
              <div className="flex items-center gap-4 text-[13px] text-blue-400 mb-6">
                <span className="cursor-pointer hover:underline">{displayAgent?.author}</span>
                <span className="text-[#555]">|</span>
                <span className="flex items-center gap-1 text-[#cccccc]"><Download size={14} /> {displayAgent?.downloads} installs</span>
                <span className="text-[#555]">|</span>
                <span className="flex items-center gap-1 text-[#cccccc]"><Star size={14} className="text-yellow-500 fill-yellow-500" /> {displayAgent?.rating} (128 reviews)</span>
              </div>
              
              <div className="flex gap-2">
                {displayAgent && installedAgents.has(displayAgent.id) ? (
                  <>
                    <button className="bg-[#37373d] hover:bg-[#45454d] text-white px-6 py-1.5 rounded-sm text-[13px] transition-colors border border-[var(--vscode-border)]">Disable</button>
                    <button
                      onClick={() => handleUninstall(displayAgent.id)}
                      disabled={installing === displayAgent.id}
                      className="bg-[#37373d] hover:bg-[#45454d] text-[#f85149] px-6 py-1.5 rounded-sm text-[13px] transition-colors border border-[var(--vscode-border)] disabled:opacity-50"
                    >
                      {installing === displayAgent.id ? "제거 중..." : "Uninstall"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => displayAgent && handleInstall(displayAgent.id)}
                    disabled={installing === displayAgent?.id}
                    className="bg-[#007acc] hover:bg-[#0062a3] text-white px-8 py-1.5 rounded-sm text-[13px] font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Download size={16} /> {installing === displayAgent?.id ? "설치 중..." : "Install"}
                  </button>
                )}
                <button className="bg-transparent hover:bg-[#37373d] text-[#cccccc] px-6 py-1.5 rounded-sm text-[13px] transition-colors border border-[var(--vscode-border)]">Config</button>
              </div>
            </div>
          </div>

          {/* Details Tabs */}
          <div className="border-b border-[var(--vscode-border)] flex gap-8 mb-6">
            <button className="pb-2 border-b-2 border-[#007acc] text-white text-[13px] font-medium font-mono uppercase tracking-wider">Details</button>
            <button className="pb-2 border-transparent text-[#858585] hover:text-white text-[13px] font-medium font-mono uppercase tracking-wider transition-colors">Contributions</button>
            <button className="pb-2 border-transparent text-[#858585] hover:text-white text-[13px] font-medium font-mono uppercase tracking-wider transition-colors">Changelog</button>
          </div>

          <div className="space-y-8 font-mono">
            <section>
              <h4 className="text-[14px] font-bold text-white mb-3 flex items-center gap-2">
                <Terminal size={16} className="text-[#007acc]" /> 에이전트 페르소나 (System Prompt)
              </h4>
              <div className="bg-[#1e1e1e] p-4 rounded border border-[var(--vscode-border)] text-[13px] leading-relaxed text-[#cccccc]">
                <p>당신은 {displayAgent?.name}입니다. {displayAgent?.description}</p>
                <p className="mt-2 text-[#858585] italic">// 1인 기업가인 '대표님'께 최상의 {displayAgent?.specialty} 솔루션을 제공하도록 훈련되었습니다.</p>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <section>
                <h4 className="text-[14px] font-bold text-white mb-3">Capabilities</h4>
                <ul className="space-y-2 text-[12px] text-[#858585]">
                  <li className="flex items-center gap-2"><Cpu size={14} className="text-[#007acc]" /> Real-time context analysis</li>
                  <li className="flex items-center gap-2"><Puzzle size={14} className="text-[#007acc]" /> Multi-agent collaboration enabled</li>
                  <li className="flex items-center gap-2"><Settings size={14} className="text-[#007acc]" /> Customizable prompt parameters</li>
                </ul>
              </section>
              <section>
                <h4 className="text-[14px] font-bold text-white mb-3">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {displayAgent?.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-[#2d2d2d] border border-[var(--vscode-border)] rounded text-[11px] text-[#858585]">{tag}</span>
                  ))}
                  <span className="px-2 py-0.5 bg-[#2d2d2d] border border-[var(--vscode-border)] rounded text-[11px] text-[#858585]">{displayAgent?.specialty}</span>
                </div>
              </section>
            </div>

            <section className="pt-6 border-t border-[var(--vscode-border)]">
              <h4 className="text-[14px] font-bold text-white mb-4">Marketplace Resources</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[12px] text-blue-400 cursor-pointer hover:underline">
                  <ExternalLink size={14} /> GitHub Repository
                </div>
                <div className="flex items-center gap-2 text-[12px] text-blue-400 cursor-pointer hover:underline">
                  <Info size={14} /> Learn more about {displayAgent?.name}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
