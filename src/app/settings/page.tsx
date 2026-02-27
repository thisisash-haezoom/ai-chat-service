"use client";

import {
  User,
  Key,
  CreditCard,
  Monitor,
  ChevronRight,
  Shield,
  Activity,
  Eye,
  EyeOff
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

const SETTINGS_MENU = [
  { id: "account", icon: User, label: "Account & Profile" },
  { id: "api-keys", icon: Key, label: "API Configuration" },
  { id: "billing", icon: CreditCard, label: "Usage & Billing" },
  { id: "appearance", icon: Monitor, label: "Appearance" },
];

interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  subscription_tier: string;
  credits: number;
  organization?: string;
}

export default function SettingsPage() {
  const [activeMenu, setActiveMenu] = useState("account");
  const [showKey, setShowKey] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [organization, setOrganization] = useState("");

  // 사용자 데이터 로드
  useEffect(() => {
    loadUserProfile();
  }, []);

  async function loadUserProfile() {
    try {
      const supabase = await createClient();

      // 현재 로그인 사용자 정보
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        setLoading(false);
        return;
      }

      // Supabase users 테이블에서 사용자 정보 조회
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (profile) {
        setUser(profile);
        setDisplayName(profile.name || "");
        setOrganization(profile.organization || "");
      }
    } catch (error) {
      console.error("프로필 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col md:flex-row h-full bg-[#1e1e1e] font-mono text-[#cccccc] overflow-hidden relative">
      {/* Settings Navigation Sidebar */}
      <div className="w-full md:w-[280px] shrink-0 bg-[#252526] border-b md:border-b-0 md:border-r border-[#333] flex flex-col h-[200px] md:h-full z-10">
        <div className="p-4 border-b border-[#333]">
          <h2 className="text-[11px] font-bold text-[#858585] uppercase tracking-widest">Settings</h2>
        </div>
        <div className="flex-1 py-2 overflow-y-auto">
          {SETTINGS_MENU.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={cn(
                "w-full px-4 py-2 flex items-center gap-3 text-[13px] transition-colors relative",
                activeMenu === item.id 
                  ? "bg-[#37373d] text-white" 
                  : "text-[#858585] hover:bg-[#2a2d2e] hover:text-[#cccccc]"
              )}
            >
              {activeMenu === item.id && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#007acc]" />}
              <item.icon size={16} />
              {item.label}
              {activeMenu === item.id && <ChevronRight size={14} className="ml-auto" />}
            </button>
          ))}
        </div>
      </div>

      {/* Settings Content Area */}
      <div className="flex-1 overflow-y-auto bg-[#1e1e1e] min-h-0">
        <div className="max-w-4xl p-4 md:p-8">
          {activeMenu === "account" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <header>
                <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Account & Profile</h1>
                <p className="text-[13px] text-[#858585]">프로필 및 협업 정보를 관리하세요.</p>
              </header>

              {loading ? (
                <div className="text-[13px] text-[#858585]">로딩 중...</div>
              ) : (
                <div className="space-y-6 bg-[#252526] border border-[#333] rounded-lg p-4 md:p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#1e1e1e] border-2 border-[#444] flex items-center justify-center overflow-hidden group relative shrink-0">
                      {user?.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt="avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={32} className="text-[#858585]" />
                      )}
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                        <span className="text-[10px] text-white">변경</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-white">{user?.name || "사용자"}</h3>
                      <p className="text-[12px] text-[#858585]">{user?.email}</p>
                      <div className="flex items-center gap-2 pt-2">
                        <span className="px-2 py-0.5 bg-[#007acc] rounded-full text-[10px] text-white font-bold tracking-tight">
                          {user?.subscription_tier || "FREE"}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-[#27c93f]">
                          <Shield size={10} /> 검증됨
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#333]">
                    <div className="space-y-2">
                      <label className="text-[11px] text-[#858585] uppercase">Display Name</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full bg-[#3c3c3c] border border-transparent focus:border-[#007acc] rounded py-1.5 px-3 text-[13px] outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] text-[#858585] uppercase">Organization</label>
                      <input
                        type="text"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        className="w-full bg-[#3c3c3c] border border-transparent focus:border-[#007acc] rounded py-1.5 px-3 text-[13px] outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#333]">
                    <button className="bg-[#007acc] hover:bg-[#0062a3] text-white px-4 py-1.5 rounded text-[12px] transition-colors font-bold">
                      저장
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeMenu === "api-keys" && (
            <div className="space-y-8 animate-in fade-in duration-300">
               <header>
                <h1 className="text-2xl font-bold text-white tracking-tight mb-2">API Configuration</h1>
                <p className="text-[13px] text-[#858585]">Configure provider keys to activate AI agents.</p>
              </header>

              <div className="space-y-4">
                {[
                  { name: "OpenAI", env: "OPENAI_API_KEY", status: "active" },
                  { name: "Anthropic", env: "ANTHROPIC_API_KEY", status: "not_set" },
                  { name: "Google Gemini", env: "GOOGLE_API_KEY", status: "active" }
                ].map(provider => (
                  <div key={provider.name} className="bg-[#252526] border border-[#333] rounded-lg p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-2 h-2 rounded-full", provider.status === 'active' ? 'bg-[#27c93f]' : 'bg-[#444]')} />
                        <h3 className="text-[14px] font-bold text-white">{provider.name}</h3>
                      </div>
                      <span className="text-[10px] text-[#858585] font-mono">{provider.env}</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input 
                          type={showKey === provider.name ? "text" : "password"} 
                          placeholder={provider.status === 'active' ? "••••••••••••••••••••••••••••••" : "Enter API Key"}
                          className="w-full bg-[#1e1e1e] border border-[#333] rounded py-1.5 px-3 text-[13px] text-[#007acc] outline-none" 
                        />
                        <button 
                          onClick={() => setShowKey(showKey === provider.name ? null : provider.name)}
                          className="absolute right-2 top-2 text-[#444] hover:text-[#858585]"
                        >
                          {showKey === provider.name ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      <button className="bg-[#37373d] hover:bg-[#45454d] text-white px-4 py-1.5 rounded text-[12px] transition-colors border border-[#333]">Update</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeMenu === "billing" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <header>
                <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Usage & Billing</h1>
                <p className="text-[13px] text-[#858585]">AI 토큰 사용량 및 크레딧을 모니터링하세요.</p>
              </header>

              {loading ? (
                <div className="text-[13px] text-[#858585]">로딩 중...</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="bg-[#252526] border border-[#333] rounded-lg p-4 md:p-6 flex flex-col items-center justify-center text-center">
                      <CreditCard size={32} className="text-[#007acc] mb-2 md:mb-4" />
                      <div className="text-2xl md:text-3xl font-bold text-white tracking-tighter">
                        {user?.credits || 0}
                      </div>
                      <div className="text-[11px] text-[#858585] mt-1 uppercase tracking-widest">남은 크레딧</div>
                    </div>
                    <div className="bg-[#252526] border border-[#333] rounded-lg p-4 md:p-6 flex flex-col items-center justify-center text-center">
                      <Activity size={32} className="text-[#27c93f] mb-2 md:mb-4" />
                      <div className="text-2xl md:text-3xl font-bold text-white tracking-tighter">
                        {user?.subscription_tier || "FREE"}
                      </div>
                      <div className="text-[11px] text-[#858585] mt-1 uppercase tracking-widest">구독 계획</div>
                    </div>
                  </div>
                </>
              )}

              <div className="bg-[#252526] border border-[#333] rounded-lg overflow-hidden">
                 <div className="p-4 border-b border-[#333] bg-[#2d2d2d]">
                    <h3 className="text-[12px] font-bold text-white">Agent Resource Usage (Top 3)</h3>
                 </div>
                 <div className="p-4 space-y-4">
                    {[
                      { name: "James (PM)", percent: 45, color: "#007acc" },
                      { name: "Kevin (Dev)", percent: 35, color: "#27c93f" },
                      { name: "Sarah (Designer)", percent: 20, color: "#ffbd2e" }
                    ].map(agent => (
                      <div key={agent.name} className="space-y-2">
                        <div className="flex justify-between text-[11px]">
                           <span className="text-[#cccccc]">{agent.name}</span>
                           <span className="text-[#858585]">{agent.percent}%</span>
                        </div>
                        <div className="h-1.5 bg-[#1e1e1e] rounded-full overflow-hidden">
                           <div className="h-full rounded-full" style={{ width: `${agent.percent}%`, backgroundColor: agent.color }} />
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
