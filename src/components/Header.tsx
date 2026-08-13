/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Menu, 
  Clock, 
  Database, 
  ShieldCheck, 
  LogOut,
  Sparkles,
  Building2
} from "lucide-react";

interface HeaderProps {
  onToggleSidebar: () => void;
  totalEntriesCount: number;
  userRole?: string;
  onLogout?: () => void;
}

export default function Header({ 
  onToggleSidebar, 
  totalEntriesCount,
  userRole = "admin",
  onLogout
}: HeaderProps) {
  // Setup standard high-fidelity Indian Standard Time format
  const getISTTime = () => {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      });
      return formatter.format(now) + " IST";
    } catch (e) {
      return new Date().toLocaleString() + " IST";
    }
  };

  const [liveTime, setLiveTime] = React.useState<string>(getISTTime());

  React.useEffect(() => {
    const updateTime = () => {
      setLiveTime(getISTTime());
    };
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="no-print bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          
          {/* Left: Mobile Sidebar Toggle + Brand Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-blue-700" />
            </button>

            <div className="flex items-center gap-3">
              <div className="lg:hidden bg-slate-50 p-1 rounded-lg border border-slate-200 flex items-center justify-center shrink-0">
                <img 
                  src="https://www.bengalrehabilitationgroup.com/images/brg_logo.png" 
                  alt="BRG Logo" 
                  className="h-8 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold font-display tracking-tight text-slate-800">
                    BRG Smart IN-EX
                  </h1>
                  <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-200/80 font-mono hidden sm:inline-block">
                    v2.0 Blue Edition
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                  Bengal Rehabilitation Group • Financial Management System
                </p>
              </div>
            </div>
          </div>

          {/* Right: Metrics & Clock */}
          <div className="flex items-center gap-3">
            
            {/* Live Synchronized Cloud Badge */}
            <div className="hidden sm:flex items-center gap-2 bg-blue-50/80 border border-blue-200/80 rounded-xl px-3 py-1.5 text-xs text-blue-900 font-bold font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>{totalEntriesCount} records synced</span>
            </div>

            {/* Live Clock */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600 font-mono">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] font-semibold">{liveTime}</span>
            </div>

            {/* User Role Badge */}
            <div className="hidden md:flex items-center gap-1.5 bg-slate-900 text-white rounded-xl px-3 py-1.5 text-xs font-bold font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span className="uppercase">{userRole}</span>
            </div>

            {/* Logout Quick Trigger */}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                title="Sign out securely"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
