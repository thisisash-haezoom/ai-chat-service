"use client";

import { GitBranch, Wifi, Bell, Code2, CheckCheck } from "lucide-react";

export function StatusBar() {
  return (
    <div className="h-6 w-full bg-[var(--vscode-status-bar)] flex items-center justify-between px-3 text-[12px] text-white">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 hover:bg-white/10 px-1 cursor-pointer transition-colors">
          <GitBranch size={14} />
          <span>main*</span>
        </div>
        <div className="flex items-center gap-1.5 hover:bg-white/10 px-1 cursor-pointer transition-colors">
          <CheckCheck size={14} />
          <span>0 Errors</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 hover:bg-white/10 px-1 cursor-pointer transition-colors text-[11px]">
          <span>UTF-8</span>
        </div>
        <div className="flex items-center gap-1.5 hover:bg-white/10 px-1 cursor-pointer transition-colors text-[11px]">
          <Code2 size={14} />
          <span>TypeScript JSX</span>
        </div>
        <div className="flex items-center gap-1.5 hover:bg-white/10 px-1 cursor-pointer transition-colors">
          <Wifi size={14} />
        </div>
        <div className="flex items-center gap-1.5 hover:bg-white/10 px-1 cursor-pointer transition-colors">
          <Bell size={14} />
        </div>
      </div>
    </div>
  );
}
