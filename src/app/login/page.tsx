"use client";

import { Bot, Terminal, Shield, LogIn, Github, Mail, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

const LoginBackground = () => {
  type ChatLog = { id: string, name: string, time: string, role: string, roleColor: string, message: string, isUser?: boolean };
  const [chatLogs, setChatLogs] = useState<ChatLog[]>([]);
  
  useEffect(() => {
    const messages: ChatLog[] = [
      { id: "log-1", name: "System", time: "10:45 AM", role: "AUTH", roleColor: "#ff5f56", message: "Connecting to Secure Gateway...", isUser: false },
      { id: "log-2", name: "System", time: "10:45 AM", role: "AUTH", roleColor: "#ff5f56", message: "Awaiting developer credentials...", isUser: false },
      { id: "log-2", name: "James (PM)", time: "10:46 AM", role: "PM", roleColor: "#007acc", message: "대표님, 접속만 하시면 바로 프로젝트 세팅 시작하겠습니다.", isUser: false },
      { id: "log-3", name: "Sarah (Designer)", time: "10:46 AM", role: "DESIGNER", roleColor: "#ffbd2e", message: "디자인 에셋 및 워크스페이스 캔버스 준비 완료.", isUser: false },
      { id: "log-4", name: "Kevin (Backend Engineer)", time: "10:47 AM", role: "BACKEND", roleColor: "#27c93f", message: "백엔드 파이프라인 스탠바이. 로그인 즉시 컨테이너 가동됩니다.", isUser: false },
      { id: "log-5", name: "Alex (Frontend Engineer)", time: "10:47 AM", role: "FRONTEND", roleColor: "#4bb3fd", message: "클라이언트 라우팅 최적화 및 메인 UI 컴포넌트 마운트 대기중입니다.", isUser: false },
      { id: "log-6", name: "Ryan (Data Engineer)", time: "10:48 AM", role: "DATA", roleColor: "#c586c0", message: "로그 분석 DB 및 프로파일링 파이프라인 연결 안정적입니다.", isUser: false },
      { id: "log-7", name: "Emma (QA Engineer)", time: "10:48 AM", role: "QA", roleColor: "#e36209", message: "통합 E2E 테스트 스위트 통과 상태 (0 Errors) 유지중입니다. ✅", isUser: false }
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
        }, 7000);
      }
    }, 1200);

    return () => clearInterval(chatInterval);
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col justify-center pl-6 lg:pl-10 pr-6 bg-[#1e1e1e]">
      {/* Gradient fades for text */}
      <div className="absolute inset-y-0 left-0 w-[50px] bg-gradient-to-r from-[#1e1e1e] to-transparent z-10" />
      <div className="absolute inset-x-0 bottom-0 h-[200px] bg-gradient-to-t from-[#1e1e1e] to-transparent z-10" />
      
      <div className="z-20 flex flex-col gap-6 w-full max-w-xl">
        <AnimatePresence>
          {chatLogs.filter(Boolean).map((log, idx) => (
            <motion.div
              key={`${log.id}-${idx}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="flex gap-4"
            >
              <div className="w-8 h-8 rounded bg-[#252526] border border-[#333] flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                <Bot size={16} style={{ color: log.roleColor }} />
              </div>
              <div className="flex-1 space-y-1.5 pt-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-[13px]">{log.name}</span>
                  <span className="text-[10px] text-[#858585]">{log.time}</span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-[#333] tracking-widest" style={{ color: log.roleColor }}>
                    {log.role}
                  </span>
                </div>
                <div className="text-[13px] leading-relaxed text-[#cccccc] font-sans">
                  {log.message}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (provider: 'google' | 'github') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="flex min-h-[100dvh] w-full bg-[#1e1e1e] font-mono text-[#cccccc] overflow-hidden">
      
      {/* Left Column: Login Modal (flex-1) */}
      <div className="flex-1 flex flex-col items-center md:items-end justify-center p-6 md:pr-6 lg:pr-10 relative z-10 border-r border-[#333]/50 bg-[#1e1e1e]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-[420px]"
        >
          <div className="bg-[#252526] border border-[#333] shadow-2xl rounded-lg overflow-hidden">
            {/* Header */}
            <div className="h-10 bg-[#323233] border-b border-[#333] flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              <div className="flex-1 text-center text-[11px] text-[#858585] tracking-tight">
                auth_provider.tsx — AI-Chat-Service
              </div>
            </div>

            <div className="p-8">
              <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-[#1e1e1e] rounded-xl border border-[#444] flex items-center justify-center mb-4 shadow-inner group">
                  <Bot size={34} className="text-[#007acc] group-hover:scale-110 transition-transform" />
                </div>
                <h1 className="text-xl font-bold text-white tracking-tighter">AI-CHAT-SERVICE</h1>
                <p className="text-[12px] text-[#858585] mt-1 text-center">AI TEAM MATE를 조인하여<br/>서비스를 이용하세요</p>
              </div>

              <div className="space-y-3">
                <button 
                  className="w-full bg-[#ffffff10] hover:bg-[#ffffff15] border border-[#444] rounded py-2.5 px-4 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                  onClick={() => handleLogin('google')}
                >
                  <img src="https://www.gstatic.com/images/branding/googlelogo/svg/googlelogo_clr_24px.svg" alt="Google" className="w-5 h-5" />
                  <span className="text-[13px] font-medium text-white">Continue with Google</span>
                </button>

                <button 
                  className="w-full bg-[#1e1e1e] hover:bg-[#252526] border border-[#444] rounded py-2.5 px-4 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                  onClick={() => handleLogin('github')}
                >
                  <Github size={20} className="text-white" />
                  <span className="text-[13px] font-medium text-white">Continue with GitHub</span>
                </button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#333]"></div></div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold text-[#444] bg-[#252526] px-2 tracking-widest">
                    Secure Access Managed
                  </div>
                </div>

                <div className="bg-[#1e1e1e] p-3 rounded border border-[#333] flex items-start gap-3">
                  <Shield size={16} className="text-[#007acc] mt-0.5 shrink-0" />
                  <div className="text-[11px] leading-relaxed text-[#858585]">
                    로그인하면 <strong>ASH PM</strong>과 <strong>AI 팀원들</strong>이 대기 중인 개발 콘솔에 즉시 연결됩니다.
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Status */}
            <div className="bg-[#007acc] h-6 flex items-center px-4 justify-between">
              <div className="flex items-center gap-3 text-[10px] text-white">
                <span className="flex items-center gap-1"><Terminal size={12} /> Ready to compile</span>
                <span className="opacity-70">v1.0.0-PRO</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-white opacity-80">
                <span>UTF-8</span>
                <span>TypeScript</span>
              </div>
            </div>
          </div>
          
          <p className="text-center mt-6 text-[10px] text-[#444] uppercase tracking-[0.2em]">
            Designed for 1-Person Enterprises by Antigravity
          </p>
        </motion.div>
      </div>

      {/* Right Column: Chat Animation Background (flex-1) */}
      <div className="hidden md:block flex-1 relative bg-[#1e1e1e]">
        <LoginBackground />
      </div>

    </div>
  );
}
