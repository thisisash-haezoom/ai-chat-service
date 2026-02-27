"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Bot, Users, Cpu, ShieldAlert, ArrowRight, CheckCircle2, Workflow, Database, HardDrive, MessageSquare, Plus, User } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const TerminalBackground = () => {
  type ChatLog = { id: string, name: string, time: string, role: string, roleColor: string, message: string, isUser?: boolean };
  const [chatLogs, setChatLogs] = useState<ChatLog[]>([]);
  const [codeText, setCodeText] = useState("");
  
  useEffect(() => {
    // Code Typing Animation
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
      i += (Math.floor(Math.random() * 3) + 1); // Type 1-3 chars at a time
      if (i > rawCode.length + 50) i = 0; // Pause at end, then loop
    }, 40);

    // Chat Logs Animation
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
        // Hold for 6 seconds, then reset
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
        {/* Left Chat Pane */}
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

        {/* Right Code Editor Pane */}
        <div className="flex-1 pl-12 flex flex-col justify-start overflow-hidden pt-8">
           <div className="text-[13px] md:text-[14px] text-[#cccccc] font-mono whitespace-pre-wrap leading-relaxed opacity-60">
              {codeText}<span className="animate-pulse bg-[#007acc] w-2 h-[15px] inline-block align-middle ml-1" />
           </div>
        </div>
      </div>
      {/* Bottom Fade */}
      <div className="absolute inset-x-0 bottom-0 h-[25vh] bg-gradient-to-t from-[#1e1e1e] to-transparent z-10" />
    </div>
  );
};


const TypewriterText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    let i = 0;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayedText(text.slice(0, i));
        i++;
        if (i > text.length) clearInterval(interval);
      }, 50);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [text, delay]);

  return <span>{displayedText}<span className="animate-pulse">_</span></span>;
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#cccccc] font-sans overflow-x-hidden selection:bg-[#007acc] selection:text-white">
      
      {/* Top Navbar */}
      <nav className="h-14 border-b border-[#333] w-full bg-[#252526] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot size={24} className="text-[#007acc]" />
            <span className="font-bold tracking-tight text-white hidden sm:block">AI TEAM MATE</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-[13px] text-[#858585] hover:text-white transition-colors">Sign In</Link>
            <Link href="/login" className="bg-[#007acc] hover:bg-[#0062a3] text-white px-4 py-1.5 rounded-sm text-[13px] font-medium transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 flex flex-col items-center justify-center min-h-[80vh] border-b border-[#333] overflow-hidden">
        <TerminalBackground />
        {/* Removed deprecated background code decor */}

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl text-center space-y-6 z-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#333]/50 border border-[#444] text-[12px] text-[#858585] mb-4">
            <Terminal size={14} className="text-[#007acc]" />
            <span>v2.0 Beta — Professional AI Integration </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tighter leading-tight font-sans">
             명령어 한 줄로 완성되는<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007acc] to-[#4bb3fd]">전속 AI 팀 빌딩.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-[#858585] max-w-2xl mx-auto font-medium">
            코딩, 디자인, 법률 검토까지. 1인 기업도 이제 완벽한 팀을 거느리세요. 한 개의 작업 공간(Workspace)에서 전문화된 AI 팀원들이 병렬로 업무를 수행합니다.
          </p>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="group w-full sm:w-auto bg-[#007acc] text-white px-8 py-4 rounded font-bold text-[15px] flex items-center justify-center gap-3 hover:bg-[#0062a3] transition-all relative overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">터미널 접속 및 팀 구성하기 <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Link>
            <div className="font-mono text-[13px] text-[#858585] bg-[#252526] px-6 py-4 rounded border border-[#333] flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[#27c93f]">$</span> <TypewriterText text="init ai-team-mate" delay={800} />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Problem Section (Error Logs) */}
      <section className="py-24 px-6 bg-[#1e1e1e] border-b border-[#333]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">매번 앵무새처럼 상황을 설명하는 일에 지치셨나요?</h2>
            <p className="text-[#858585]">기존 단일 AI 채팅 도구들이 가진 치명적인 한계점들</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 font-mono">
            {[
              { error: "Error 404: Context Lost", desc: "GPT나 Gemini에게 수십 번 맥락을 다시 가르쳐도 다음 날이면 초기화되는 답답함." },
              { error: "Warning: Low Performance", desc: "전문적인 프롬프트 엔지니어링 지식이 없어 AI의 진짜 실력을 20%밖에 끌어내지 못함." },
              { error: "Fatal: Single Thread", desc: "하나의 창에서만 질문/대답이 오갈 뿐, 여러 직무의 AI가 서로 협업하는 워크플로우를 만들 수 없음." },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#252526] p-6 border border-[#333] rounded list-none relative overflow-hidden group hover:border-[#ff5f56] transition-colors"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ff5f56] opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-2 text-[#ff5f56] font-bold text-[13px] mb-3">
                  <ShieldAlert size={16} /> {item.error}
                </div>
                <p className="text-[#cccccc] text-[13px] leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Section (Interfaces) */}
      <section className="py-24 px-6 bg-[#252526] border-b border-[#333]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">혼자서 거대한 성과를 만들어야 하는 당신을 위해</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { role: "Solopreneur / CEO", need: "내 아이디어를 당장 실행해줄 전문 실무진", color: "#007acc" },
              { role: "Office Worker / Dev", need: "내 전문 분야 밖의 지식(마케팅/법무) 지원", color: "#ffbd2e" },
              { role: "Team Leader", need: "반복적인 실무를 완벽하게 받쳐줄 서브 팀원", color: "#27c93f" },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-[#1e1e1e] rounded border border-[#333] font-mono p-1 overflow-hidden"
              >
                <div className="bg-[#2d2d2d] px-4 py-2 text-[11px] text-[#858585] flex items-center gap-2 border-b border-[#333]">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  target_{i+1}.ts
                </div>
                <div className="p-4 text-[13px]">
                  <span className="text-[#007acc]">interface</span> <span className="text-[#4bb3fd]">{item.role.replace(/ \/ | /g, '')}</span> {'{'}
                  <div className="pl-4 py-2 space-y-2">
                    <div className="text-[#858585]">// 타겟층 및 핵심 니즈</div>
                    <div><span className="text-[#9cdcfe]">role</span>: <span className="text-[#ce9178]">'{item.role}'</span>;</div>
                    <div><span className="text-[#9cdcfe]">need</span>: <span className="text-[#ce9178]">'{item.need}'</span>;</div>
                    <div><span className="text-[#9cdcfe]">solution</span>: <span className="text-[#4ec9b0]">AITeamMate</span>;</div>
                  </div>
                  {'}'}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions / Features Section */}
      <section className="py-24 px-6 bg-[#1e1e1e] border-b border-[#333]">
        <div className="max-w-6xl mx-auto">
           <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">프로젝트의 파이프라인을 완전히 바꿀 3가지 기능</h2>
          </div>

          <div className="space-y-16">
            {/* Feature 1 */}
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 space-y-4">
                <div className="w-12 h-12 bg-[#252526] border border-[#333] rounded-lg flex items-center justify-center text-[#007acc] mb-6">
                  <Workflow size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white">플러그 앤 플레이 (Plug & Play)</h3>
                <p className="text-[#858585] text-lg leading-relaxed">
                  필요한 직군의 AI 팀원을 마켓플레이스에서 버튼 한 번으로 영입하세요. James(기획자), Sarah(디자이너), Kevin(프론트) 등 이미 검증된 글로벌 전문가의 워크플로우가 당신의 시스템에 즉시 설치됩니다.
                </p>
              </div>
              <div className="flex-1 w-full bg-[#252526] border border-[#333] rounded-lg p-4 shadow-2xl skew-y-1 md:-skew-y-2">
                 <div className="flex items-center gap-2 mb-4 border-b border-[#333] pb-2 text-[12px] text-[#858585] font-mono"><Users size={14} /> EXTENSIONS: MARKETPLACE</div>
                 <div className="space-y-2">
                   {[1,2,3].map(i => (
                     <div key={i} className="flex items-center justify-between p-3 bg-[#1e1e1e] rounded border border-[#333]">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded bg-[#333] flex items-center justify-center"><Bot size={16} /></div>
                         <div className="space-y-0.5">
                           <div className="text-[13px] text-white font-bold">Expert AI {i}</div>
                           <div className="text-[11px] text-[#858585]">Verified Workflow ✨</div>
                         </div>
                       </div>
                       <button className="bg-[#007acc] text-white text-[11px] px-3 py-1 rounded">Install</button>
                     </div>
                   ))}
                 </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
              <div className="flex-1 space-y-4">
                <div className="w-12 h-12 bg-[#252526] border border-[#333] rounded-lg flex items-center justify-center text-[#27c93f] mb-6">
                  <Database size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white">독립된 영구 채널 (Persistent Context)</h3>
                <p className="text-[#858585] text-lg leading-relaxed">
                  프로젝트별로 부여되는 독립 채널은 브라우저를 꺼도 휘발되지 않습니다. 당신이 생성한 프로젝트의 맥락과 히스토리는 영구적으로 보존되어, 언제 접속해도 바로 이어서 작업 지시가 가능합니다.
                </p>
              </div>
              <div className="flex-1 w-full bg-[#252526] border border-[#333] rounded-lg p-4 shadow-2xl -skew-y-1 md:skew-y-2">
                 <div className="flex items-center gap-2 mb-4 border-b border-[#333] pb-2 text-[12px] text-[#858585] font-mono"><MessageSquare size={14} /> CHANNELS</div>
                 <div className="space-y-2 font-mono text-[13px]">
                   <div className="flex items-center justify-between p-2 bg-[#1e1e1e] rounded text-white border-l-2 border-[#27c93f]">
                      <span># project-vibe</span>
                      <span className="text-[10px] text-[#858585]">Saved 2 mins ago</span>
                   </div>
                   <div className="flex items-center justify-between p-2 hover:bg-[#1e1e1e] rounded text-[#858585]">
                      <span># marketing-q4</span>
                   </div>
                   <div className="flex items-center justify-between p-2 hover:bg-[#1e1e1e] rounded text-[#858585]">
                      <span># code-refactor</span>
                   </div>
                 </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 space-y-4">
                <div className="w-12 h-12 bg-[#252526] border border-[#333] rounded-lg flex items-center justify-center text-[#ffbd2e] mb-6">
                  <HardDrive size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white">칸반 대시보드 (Kanban Dashboard)</h3>
                <p className="text-[#858585] text-lg leading-relaxed">
                  에이전트들이 알아서 일을 진행하고 보고합니다. 대표님은 보고 탭에서 병렬적으로 진행되는 작업들의 진척도를 뷰(View)로 확인하고 <span className="text-white font-bold bg-[#333] px-1 rounded">[Approve]</span> 컨펌만 땡기시면 됩니다.
                </p>
              </div>
              <div className="flex-1 w-full bg-[#252526] border border-[#333] rounded-lg p-4 shadow-2xl skew-y-1 md:-skew-y-2">
                <div className="flex gap-4 font-sans">
                  {/* Kanban Column */}
                  <div className="flex-1 bg-[#1e1e1e] p-2 rounded">
                    <div className="text-[11px] text-[#858585] font-bold mb-2 uppercase">In Progress</div>
                    <div className="bg-[#2d2d2d] p-3 rounded border border-[#444] shadow-sm mb-2">
                      <div className="text-[12px] text-white font-bold mb-1">DB Schema Design</div>
                      <div className="flex items-center justify-between text-[10px] text-[#858585]">
                        <span className="flex items-center gap-1"><Bot size={10} className="text-[#ffbd2e]"/> Backend Dev</span>
                        <span className="text-[#007acc] animate-pulse">Running...</span>
                      </div>
                    </div>
                  </div>
                  {/* Kanban Column */}
                  <div className="flex-1 bg-[#1e1e1e] p-2 rounded">
                    <div className="text-[11px] text-[#858585] font-bold mb-2 uppercase">Review (Need Approval)</div>
                    <div className="bg-[#252526] p-3 rounded border border-[#007acc] shadow-sm mb-2 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-2 h-2 bg-[#007acc] rounded-bl" />
                      <div className="text-[12px] text-white font-bold mb-1">Landing Page UI</div>
                      <div className="flex items-center justify-between text-[10px] text-[#858585] mb-2">
                        <span className="flex items-center gap-1"><Bot size={10} className="text-[#007acc]"/> UX Designer</span>
                      </div>
                      <button className="w-full bg-[#007acc]/20 text-[#007acc] border border-[#007acc]/50 rounded py-1 text-[11px] font-bold hover:bg-[#007acc] hover:text-white transition-colors">Approve Work</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-6 bg-[#252526] border-b border-[#333]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">당신의 개발팀을 유지하는 가장 합리적인 방법</h2>
            <p className="text-[#858585]">필요한 규모에 맞게 라이선스를 활성화하세요.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 font-mono">
             {/* Free */}
             <div className="bg-[#1e1e1e] border border-[#333] rounded-lg p-6 relative">
               <h3 className="text-xl font-bold text-white mb-2">FREE</h3>
               <p className="text-[#858585] text-[13px] mb-6 h-10">가벼운 개인 토이 프로젝트 및 체험용</p>
               <div className="text-3xl font-bold text-white mb-6">$0 <span className="text-[14px] text-[#858585] font-normal">/ mo</span></div>
               <ul className="space-y-3 mb-8 text-[13px] text-[#cccccc]">
                 <li className="flex items-center gap-2"><CheckCircle2 className="text-[#444]" size={16} /> 기본 에이전트 2명 제공</li>
                 <li className="flex items-center gap-2"><CheckCircle2 className="text-[#444]" size={16} /> 일일 채팅 트래픽 제한</li>
                 <li className="flex items-center gap-2"><CheckCircle2 className="text-[#444]" size={16} /> 공용 워크스페이스 1개</li>
               </ul>
               <Link href="/login" className="block w-full text-center bg-[#333] hover:bg-[#444] text-white py-2 rounded transition-colors text-[14px] font-bold">Start Free</Link>
             </div>

             {/* Basic */}
             <div className="bg-[#2d2d2d] border border-[#007acc] rounded-lg p-6 relative transform md:-translate-y-4 shadow-xl">
               <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-[#007acc] text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">Most Popular</div>
               <h3 className="text-xl font-bold text-white mb-2 text-[#007acc]">BASIC</h3>
               <p className="text-[#858585] text-[13px] mb-6 h-10">1인 창업가, 소규모 프리랜서를 위한 완벽한 솔루션</p>
               <div className="text-3xl font-bold text-[#007acc] mb-6">$29 <span className="text-[14px] text-[#858585] font-normal">/ mo</span></div>
               <ul className="space-y-3 mb-8 text-[13px] text-white">
                 <li className="flex items-center gap-2"><CheckCircle2 className="text-[#007acc]" size={16} /> 마켓플레이스 에이전트 무제한 접근</li>
                 <li className="flex items-center gap-2"><CheckCircle2 className="text-[#007acc]" size={16} /> 독립된 채널 생성 무제한</li>
                 <li className="flex items-center gap-2"><CheckCircle2 className="text-[#007acc]" size={16} /> 전문 Workflow 시스템 사용</li>
                 <li className="flex items-center gap-2"><CheckCircle2 className="text-[#007acc]" size={16} /> 우선 지원 (Priority Support)</li>
               </ul>
               <Link href="/login" className="block w-full text-center bg-[#007acc] hover:bg-[#0062a3] text-white py-2 rounded transition-colors text-[14px] font-bold">Subscribe</Link>
             </div>

             {/* VIP */}
             <div className="bg-[#1e1e1e] border border-[#333] rounded-lg p-6 relative">
               <h3 className="text-xl font-bold text-white mb-2">VIP <span className="text-[12px] text-[#858585] ml-1">(Enterprise)</span></h3>
               <p className="text-[#858585] text-[13px] mb-6 h-10">풀스택 기업형 에이전트 팀 구축용</p>
               <div className="text-3xl font-bold text-white mb-6">$99 <span className="text-[14px] text-[#858585] font-normal">/ mo</span></div>
               <ul className="space-y-3 mb-8 text-[13px] text-[#cccccc]">
                 <li className="flex items-center gap-2"><CheckCircle2 className="text-[#ffbd2e]" size={16} /> 칸반 대시보드 무제한 사용</li>
                 <li className="flex items-center gap-2"><CheckCircle2 className="text-[#ffbd2e]" size={16} /> 최고 성능 AI 모델 우선 접근권</li>
                 <li className="flex items-center gap-2"><CheckCircle2 className="text-[#ffbd2e]" size={16} /> 기업 자체 데이터 커스텀 학습 허용</li>
               </ul>
               <Link href="/login" className="block w-full text-center bg-[#333] hover:bg-[#444] text-white py-2 rounded transition-colors text-[14px] font-bold">Contact Sales</Link>
             </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="font-mono text-[#007acc] text-xl font-bold">&gt; initialize_ai_team.sh</div>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">이제 지시만 내리세요.<br />실무는 저희가 합니다.</h2>
          <p className="text-[#858585] text-lg">AI TEAM MATE와 함께 새로운 비즈니스를 시작하세요.</p>
          <div className="pt-4 flex justify-center">
             <Link href="/login" className="bg-white text-black hover:bg-[#cccccc] transition-colors font-bold px-10 py-4 rounded-md text-lg flex items-center gap-2 shadow-xl shadow-white/10 active:scale-95 duration-200">
               지금 바로 나의 AI 팀 시작하기 <ArrowRight size={20} />
             </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer bg-[#1e1e1e] border-t border-[#333] py-8 text-center text-[12px] text-[#858585] font-mono">
        <p>Copyright © 2026 AI TEAM MATE. Powered by Antigravity.</p>
        <p className="mt-2">Designed for Solopreneurs and Future Enterprises.</p>
      </footer>
    </div>
  );
}
