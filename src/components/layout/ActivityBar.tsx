"use client";

import { 
  Files, 
  Search, 
  GitBranch, 
  LayoutGrid, 
  Settings, 
  UserCircle2,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const topIcons = [
  { id: "chat", icon: MessageSquare, label: "Chat" },
  { id: "agents", icon: LayoutGrid, label: "Agents" },
  { id: "search", icon: Search, label: "Search" },
  { id: "source", icon: GitBranch, label: "Source Control" },
];

const bottomIcons = [
  { id: "settings", icon: Settings, label: "Settings" },
  { id: "account", icon: UserCircle2, label: "Account" },
];

export function ActivityBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("chat");

  useEffect(() => {
    if (pathname === "/" || pathname.startsWith("/chat")) setActiveTab("chat");
    else if (pathname.startsWith("/agents")) setActiveTab("agents");
    else if (pathname.startsWith("/settings")) setActiveTab("settings");
    else if (pathname.startsWith("/login")) setActiveTab("account");
  }, [pathname]);

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    if (id === "chat") router.push("/chat");
    else if (id === "agents") router.push("/agents");
    else if (id === "settings") router.push("/settings");
    else if (id === "account") router.push("/login");
  };

  return (
    <>
      {/* Mobile View: Horizontal Tab Bar */}
      <div className="md:hidden w-full h-14 flex items-center justify-around px-2">
        {[...topIcons, ...bottomIcons].map((item) => (
          <button
            key={item.id}
            onClick={() => handleTabClick(item.id)}
            className={cn(
              "h-full px-4 flex flex-col items-center justify-center transition-all relative",
              activeTab === item.id 
                ? "text-white" 
                : "text-[#858585] hover:text-[#cccccc]"
            )}
          >
            {activeTab === item.id && <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#007acc]" />}
            <item.icon size={20} strokeWidth={activeTab === item.id ? 2 : 1.5} />
            <span className="text-[9px] mt-1 font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Desktop View: Vertical Activity Bar */}
      <div className="hidden md:flex w-[48px] h-full flex-col items-center py-2">
        <div className="flex-1 w-full flex flex-col items-center gap-2">
          {topIcons.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={cn(
                "w-full h-12 flex items-center justify-center transition-all relative group",
                activeTab === item.id 
                  ? "text-white border-l-2 border-white" 
                  : "text-[#858585] hover:text-white"
              )}
              title={item.label}
            >
              <item.icon size={24} strokeWidth={1.5} />
              <span className="sr-only">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="w-full flex flex-col items-center gap-2 mt-auto">
          {bottomIcons.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={cn(
                "w-full h-12 flex items-center justify-center transition-all relative group",
                activeTab === item.id 
                  ? "text-white border-l-2 border-white" 
                  : "text-[#858585] hover:text-white"
              )}
              title={item.label}
            >
              <item.icon size={24} strokeWidth={1.5} />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
