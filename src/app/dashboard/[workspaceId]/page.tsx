"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import ChatEditor from "@/components/chat/ChatEditor";
import { Copy, Code2, Play, CheckCircle2, MoreHorizontal, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  sender_type: string;
  sender_id?: string;
  content: string;
  created_at: string;
  senderName?: string;
  senderRole?: string;
  senderColor?: string;
}

interface Workspace {
  id: string;
  project_name: string;
}


export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const supabase = createClient();

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeLogs, setActiveLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userName, setUserName] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, [workspaceId]);

  // 메시지 변경 시 자동 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function loadData() {
    try {
      setLoading(true);

      // 사용자 확인
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      setUserName(user.user_metadata?.full_name || user.email || "User");

      // 워크스페이스 조회
      const workspaceResponse = await fetch("/api/workspaces");
      const workspaceResult = await workspaceResponse.json();
      const ws = workspaceResult.data?.workspaces?.find(
        (w: Workspace) => w.id === workspaceId
      );

      if (!ws) {
        router.push("/dashboard");
        return;
      }

      setWorkspace(ws);

      // 메시지 조회
      const messagesResponse = await fetch(
        `/api/chats/${workspaceId}?limit=50&offset=0`
      );
      const messagesResult = await messagesResponse.json();

      if (messagesResult.success) {
        setMessages(messagesResult.data.messages || []);
      }
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSend(content: string) {
    if (!content.trim() || !workspaceId) return;

    // 1. 사용자 메시지 optimistic update (즉시 화면에 추가)
    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      sender_type: "USER",
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setSending(true);

    // 로그에 메시지 추가
    const logTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    setActiveLogs((prev) => [...prev.slice(-3), `[${logTime}] ${content.substring(0, 50)}...`]);

    try {
      const response = await fetch(
        `/api/chats/${workspaceId}/message`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        }
      );

      if (response.ok && response.headers.get("content-type")?.includes("text/event-stream")) {
        // SSE 스트리밍 처리
        const reader = response.body?.getReader();
        if (!reader) return;

        let aiMessage = {
          id: Date.now().toString(),
          sender_type: "AGENT",
          content: "",
          created_at: new Date().toISOString(),
          senderName: "James",
          senderRole: "PM",
          senderColor: "#007acc",
        };

        setMessages((prev) => [...prev, aiMessage]);

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");

          for (let i = 0; i < lines.length - 1; i++) {
            const line = lines[i];
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === "text") {
                  aiMessage.content += data.content;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === aiMessage.id ? { ...aiMessage } : msg
                    )
                  );
                }
              } catch (e) {
                console.error("파싱 에러:", e);
              }
            }
          }

          buffer = lines[lines.length - 1];
        }

        // SSE 완료 후 로그 업데이트 (새로고침 하지 않음)
        setActiveLogs((prev) => [...prev.slice(-3), `[${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}] AI response completed.`]);
      }
    } catch (error) {
      console.error("메시지 전송 실패:", error);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin">
          <div className="w-8 h-8 border-2 border-[#007acc] border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--vscode-editor)] font-mono">
      {/* Header */}
      <header className="h-9 border-b border-[var(--vscode-border)] flex items-center justify-between px-4 bg-[var(--vscode-editor)] select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 bg-[#2d2d2d] rounded-t-sm border-t border-x border-[var(--vscode-border)] border-b-transparent">
            <Code2 size={14} className="text-[#007acc]" />
            <span className="text-[12px] text-[#cccccc]">{workspace?.project_name || "Chat"}</span>
          </div>
          <span className="text-[11px] text-[#858585] ml-2">ai-chat-service &gt; project</span>
        </div>
        <div className="flex items-center gap-4 text-[#858585]">
          <Play size={14} className="hover:text-green-500 cursor-pointer" />
          <Copy size={14} className="hover:text-white cursor-pointer" />
          <MoreHorizontal size={14} className="hover:text-white cursor-pointer" />
        </div>
      </header>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto pt-4 scrollbar-thin scrollbar-thumb-[#333] hover:scrollbar-thumb-[#444]"
      >
        <AnimatePresence>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full pb-20">
              <div className="text-center space-y-4">
                <div className="text-[#444] text-5xl">💬</div>
                <p className="text-[#858585]">아직 메시지가 없습니다</p>
                <p className="text-[#666] text-[12px]">AI 팀과 함께 일을 시작하세요</p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex group hover:bg-[#2a2d2e] py-0.5 transition-colors relative"
              >
                {/* 라인 넘버 */}
                <div className="hidden md:block w-12 shrink-0 text-right pr-4 text-[12px] text-[#858585] select-none pt-1">
                  {idx + 1}
                </div>

                {/* 메시지 내용 */}
                <div className="flex-1 min-w-0 px-4 md:px-0 md:pr-8">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[12px] font-bold"
                      style={{ color: msg.senderColor || "#cccccc" }}
                    >
                      {msg.sender_type === "USER"
                        ? userName
                        : msg.senderName || "Agent"}
                    </span>
                    <span className="text-[10px] text-[#858585]">
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {msg.sender_type === "AGENT" && (
                      <span
                        className="text-[9px] px-1 border rounded uppercase font-bold"
                        style={{
                          borderColor: `${msg.senderColor}40`,
                          color: msg.senderColor,
                        }}
                      >
                        {msg.senderRole || "AGENT"}
                      </span>
                    )}
                  </div>
                  <div
                    className="chat-message-content text-[14px] text-[#cccccc] leading-relaxed font-sans mt-1"
                    dangerouslySetInnerHTML={{ __html: msg.content }}
                  />
                </div>

                {/* Copy 버튼 (hover 시 표시) */}
                <div className="absolute right-4 top-1 opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(msg.content);
                    }}
                    className="p-1 hover:bg-[#37373d] rounded text-[#858585] hover:text-white"
                    title="메시지 복사"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Terminal Area (Output Logs) */}
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

      {/* Input Area */}
      <div className="p-4 bg-[var(--vscode-editor)] border-t border-[var(--vscode-border)]">
        <ChatEditor onSend={handleSend} disabled={sending} placeholder={`${workspace?.project_name || "chat"}에 메시지 보내기`} />
        <div className="text-[10px] text-[#858585] mt-2 flex items-center justify-between px-1">
          <div className="flex items-center gap-1"><Terminal size={10} /> Active: {userName} v1.0.0</div>
          <div className="flex items-center gap-1 text-green-500/70">
            <CheckCircle2 size={10} /> Connected
          </div>
        </div>
      </div>
    </div>
  );
}
