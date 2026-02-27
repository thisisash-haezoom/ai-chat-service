"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import ChatEditor from "@/components/chat/ChatEditor";
import { Copy, Code2, Play, CheckCircle2, MoreHorizontal, ArrowLeft } from "lucide-react";
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
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    loadData();
  }, [workspaceId]);

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
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSend(content: string) {
    if (!content.trim() || !workspaceId) return;

    setSending(true);

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
                console.error("Parse error:", e);
              }
            }
          }

          buffer = lines[lines.length - 1];
        }

        // 새로고침
        await loadData();
      }
    } catch (error) {
      console.error("Error sending message:", error);
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
          <button
            onClick={() => router.push("/dashboard")}
            className="p-1 hover:bg-[#333] rounded transition-colors"
            title="대시보드로 이동"
          >
            <ArrowLeft size={14} className="text-[#858585]" />
          </button>
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
      <div className="flex-1 overflow-y-auto pt-4 scrollbar-thin scrollbar-thumb-[#333] hover:scrollbar-thumb-[#444]">
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
            messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex group hover:bg-[#2a2d2e] py-0.5 transition-colors relative px-4 md:px-0 md:pr-8"
              >
                <div className="flex-1 min-w-0">
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
                  <div className="text-[14px] text-[#cccccc] leading-relaxed font-sans mt-1 whitespace-pre-wrap break-words">
                    {msg.content}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[var(--vscode-editor)] border-t border-[var(--vscode-border)]">
        <ChatEditor onSend={handleSend} disabled={sending} />
        <div className="text-[10px] text-[#858585] mt-2 flex items-center justify-between px-1">
          <div className="flex items-center gap-1">Ready</div>
          <div className="flex items-center gap-1 text-green-500/70">
            <CheckCircle2 size={10} /> Connected
          </div>
        </div>
      </div>
    </div>
  );
}
