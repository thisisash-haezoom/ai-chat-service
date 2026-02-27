"use client";

import { ActivityBar } from "./ActivityBar";
import { Sidebar } from "./Sidebar";
import { StatusBar } from "./StatusBar";
import { useState } from "react";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  if (pathname === "/" || pathname === "/login") {
    return <main className="w-full h-[100dvh] overflow-y-auto overflow-x-hidden bg-[var(--vscode-editor)]">{children}</main>;
  }

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[var(--vscode-editor)] overflow-hidden text-[#cccccc] font-sans">
      
      {/* Main Content Area (above Status Bar) */}
      <div className="flex flex-col-reverse md:flex-row flex-1 overflow-hidden min-h-0">
        
        {/* Navigation / Activity Bar */}
        <div className="shrink-0 z-50 bg-[var(--vscode-activity-bar)] border-t md:border-t-0 md:border-r border-[var(--vscode-border)]">
          <ActivityBar />
        </div>
        
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" 
            onClick={() => setSidebarOpen(false)} 
          />
        )}

        {/* Sidebar Wrapper */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 md:relative md:flex transition-transform duration-300 ease-in-out h-full md:h-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Center Editor/Page Content */}
        <div className="flex flex-col flex-1 min-w-0 relative">
          {/* Mobile Header for Sidebar Toggle */}
          <div className="md:hidden h-12 shrink-0 border-b border-[var(--vscode-border)] bg-[var(--vscode-sidebar)] flex items-center justify-between px-4 z-30">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="text-[#858585] hover:text-white transition-colors">
                <Menu size={20} />
              </button>
              <span className="text-[13px] font-semibold text-white tracking-widest">James PM Workspace</span>
            </div>
          </div>

          <main className="flex-1 overflow-auto relative">
            {children}
          </main>
        </div>
      </div>

      {/* Global Status Bar (Full Width at Bottom) */}
      <div className="hidden md:block shrink-0 z-50">
        <StatusBar />
      </div>
    </div>
  );
}

