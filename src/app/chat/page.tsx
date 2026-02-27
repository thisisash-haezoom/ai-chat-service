"use client";

import { Copy, Smile, Bot, Terminal, Code2, Play, CheckCircle2, MoreHorizontal } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatEditor from "@/components/chat/ChatEditor";

const INITIAL_MESSAGES = [
  { 
    id: 1, 
    sender: "James (PM)", 
    role: "PM", 
    html: "<p>충성! 대표님, 프로젝트 'Vibe-Runner' 기획안 초안 공유드립니다.</p><pre><code>## Project: Vibe-Runner\n- MVP Goal: AI Chat interface\n- Tech Stack: Next.js, Tailwind, Framer Motion</code></pre>", 
    time: "10:00 AM", 
    isAgent: true,
    roleColor: "#007acc",
    lines: [1, 5]
  },
  { 
    id: 2, 
    sender: "Sarah (Designer)", 
    role: "DESIGNER", 
    html: "<p>디자인 시안 1차 작업 완료되었습니다. 다크 모드 기반의 <strong>VS Code 스타일</strong>을 적용해봤는데 어떠신가요? CSS 변수 정리가 필요하시면 말씀해주세요.</p>", 
    time: "10:05 AM", 
    isAgent: true,
    roleColor: "#ffbd2e",
    lines: [6, 8]
  },
  { 
    id: 3, 
    sender: "Kevin (Backend Engineer)", 
    role: "BACKEND", 
    html: "<p>랜딩페이지 폼 제출용 API 라우트(<code>/api/waitlist</code>) 작성 및 <strong>Supabase DB 연동</strong> 완료해두었습니다. 프론트엔드 연결하시면 됩니다.</p>", 
    time: "10:08 AM", 
    isAgent: true,
    roleColor: "#27c93f",
    lines: [9, 10]
  },
  { 
    id: 4, 
    sender: "Ash (CEO)", 
    role: "USER", 
    html: "<p>오, 좋습니다. 특히 에이전트들이 한곳에서 보고하는 방식이 마음에 드네요. 더 '개발스러운' 느낌을 많이 살려주세요.</p>", 
    time: "10:10 AM", 
    isAgent: false,
    roleColor: "#cccccc",
    lines: [11, 13]
  },
];

const LOGS = [
  "[16:30:02] PM James initialized workspace...",
  "[16:30:45] Sarah uploaded design_assets.zip",
  "[16:31:12] Kevin connected to repository...",
  "[16:32:05] Build successful. Deployment in progress.",
];

export default function ChatPage() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [activeLogs, setActiveLogs] = useState(LOGS);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (html: string) => {
    const lastLine = messages[messages.length - 1].lines[1];

    const newMessage = {
      id: messages.length + 1,
      sender: "Ash (CEO)",
      role: "USER",
      html,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAgent: false,
      roleColor: "#cccccc",
      lines: [lastLine + 1, lastLine + 3]
    };
    setMessages([...messages, newMessage]);
    
    // Simulate James responding
    setTimeout(() => {
      const logTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      setActiveLogs(prev => [...prev.slice(-3), `[${logTime}] User input received. Processing...`]);
    }, 500);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--vscode-editor)] font-mono">
      {/* Thread Header */}
      <header className="h-9 border-b border-[var(--vscode-border)] flex items-center justify-between px-4 bg-[var(--vscode-editor)] select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 bg-[#2d2d2d] rounded-t-sm border-t border-x border-[var(--vscode-border)] border-b-transparent">
             <Code2 size={14} className="text-[#007acc]" />
             <span className="text-[12px] text-[#cccccc]">main.chat.tsx</span>
          </div>
          <span className="text-[11px] text-[#858585] ml-2">ai-chat-service &gt; src &gt; project</span>
        </div>
        <div className="flex items-center gap-4 text-[#858585]">
          <Play size={14} className="hover:text-green-500 cursor-pointer" />
          <Copy size={14} className="hover:text-white cursor-pointer" />
          <MoreHorizontal size={14} className="hover:text-white cursor-pointer" />
        </div>
      </header>

      {/* Messages Area with Line Numbers */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto pt-4 scrollbar-thin scrollbar-thumb-[#333] hover:scrollbar-thumb-[#444]"
      >
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex group hover:bg-[#2a2d2e] py-0.5 transition-colors relative"
            >
              {/* Line Numbers */}
              <div className="hidden md:block w-12 shrink-0 text-right pr-4 text-[12px] text-[#858585] select-none pt-1">
                {msg.lines[0]}
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0 px-4 md:px-0 md:pr-8">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[12px] font-bold" style={{ color: msg.roleColor }}>
                    {msg.sender}
                  </span>
                  <span className="text-[10px] text-[#858585]">{msg.time}</span>
                  {msg.isAgent && (
                    <span 
                      className="text-[9px] px-1 border rounded uppercase font-bold" 
                      style={{ borderColor: `${msg.roleColor}40`, color: msg.roleColor }}
                    >
                      {msg.role}
                    </span>
                  )}
                </div>
                <div 
                  className="chat-message-content text-[14px] text-[#cccccc] leading-relaxed font-sans mt-1"
                  dangerouslySetInnerHTML={{ __html: msg.html }}
                />
              </div>

              {/* Message Actions (Visible on Hover) */}
              <div className="absolute right-4 top-1 opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                <button className="p-1 hover:bg-[#37373d] rounded text-[#858585] hover:text-white"><Copy size={14} /></button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Terminal Area (Logs) - Hidden on Mobile */}
      <div className="hidden md:flex h-[120px] border-t border-[var(--vscode-border)] bg-[#1e1e1e] flex-col shrink-0">
        <div className="h-8 border-b border-[var(--vscode-border)] flex items-center px-4 gap-4 bg-[#252526]">
          <button className="text-[11px] font-bold text-[#cccccc] border-b border-white h-full px-1 uppercase tracking-tighter">Terminal</button>
          <button className="text-[11px] font-bold text-[#858585] hover:text-[#cccccc] h-full px-1 uppercase tracking-tighter">Output</button>
          <button className="text-[11px] font-bold text-[#858585] hover:text-[#cccccc] h-full px-1 uppercase tracking-tighter">Debug Console</button>
        </div>
        <div className="flex-1 p-2 overflow-y-auto font-mono text-[11px] text-[#858585] leading-normal">
          {activeLogs.map((log, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-green-500 shrink-0">➜</span>
              <span>{log}</span>
            </div>
          ))}
          <div className="flex gap-2 animate-pulse">
            <span className="text-blue-500 shrink-0">➜</span>
            <span className="bg-[#ccc] w-2 h-4" />
          </div>
        </div>
      </div>

      {/* Input Area (TipTap WYSIWYG Editor) */}
      <div className="p-4 bg-[var(--vscode-editor)] border-t border-[var(--vscode-border)]">
        <ChatEditor onSend={handleSend} />
        <div className="text-[10px] text-[#858585] mt-2 flex items-center justify-between px-1">
           <div className="flex items-center gap-1"><Terminal size={10} /> Active: James-PM-v1.0.4</div>
           <div className="flex items-center gap-1 text-green-500/70"><CheckCircle2 size={10} /> Syncing with codebase</div>
        </div>
      </div>
    </div>
  );
}
