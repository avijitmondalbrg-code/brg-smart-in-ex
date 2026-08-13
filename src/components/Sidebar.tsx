/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  BarChart3, 
  ClipboardList, 
  TrendingDown, 
  Users, 
  Settings, 
  X,
  ChevronRight,
  Database,
  Building2,
  LogOut,
  ShieldCheck,
  Activity
} from "lucide-react";

export type NavTab = "dashboard" | "ledger" | "expenses" | "patients" | "settings";

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  totalEntriesCount: number;
  userRole: string;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onLogout: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  totalEntriesCount,
  userRole,
  isMobileOpen,
  setIsMobileOpen,
  onLogout
}: SidebarProps) {

  const navItems: {
    id: NavTab;
    label: string;
    sublabel: string;
    icon: React.ElementType;
    badge?: string | number;
  }[] = [
    {
      id: "dashboard",
      label: "Diagnostic Dashboard",
      sublabel: "KPIs & Revenue Analytics",
      icon: BarChart3
    },
    {
      id: "ledger",
      label: "Direct Entry & Ledger",
      sublabel: "Receipt Form & Intake Logs",
      icon: ClipboardList,
      badge: totalEntriesCount > 0 ? totalEntriesCount : undefined
    },
    {
      id: "expenses",
      label: "Outflow Expenses",
      sublabel: "Disbursement & Commissions",
      icon: TrendingDown
    },
    {
      id: "patients",
      label: "Patient Database",
      sublabel: "Complete Clinical History",
      icon: Users
    },
    {
      id: "settings",
      label: "Database & Settings",
      sublabel: "Backups, Restores & Sync",
      icon: Settings
    }
  ];

  const handleSelect = (tab: NavTab) => {
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Left Sidebar Panel */}
      <aside className={`
        no-print fixed lg:static top-0 left-0 bottom-0 z-50
        w-72 bg-slate-900 text-slate-100 flex flex-col justify-between
        border-r border-slate-800 shadow-xl lg:shadow-none
        transform transition-transform duration-300 ease-in-out shrink-0
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        
        {/* Top Header & Brand */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-white p-1.5 rounded-xl flex items-center justify-center shrink-0 shadow-xs border border-slate-200">
                <img 
                  src="https://www.bengalrehabilitationgroup.com/images/brg_logo.png" 
                  alt="BRG Logo" 
                  className="h-9 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="bg-blue-900/80 text-blue-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-700/60 font-mono">
                    BRG IN-EX
                  </span>
                </div>
                <h1 className="text-sm font-extrabold font-display tracking-tight text-white mt-0.5">
                  Bengal Rehab Group
                </h1>
                <p className="text-[11px] text-slate-400 font-medium">
                  Financial Portal v2.0
                </p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="px-3 py-4 flex-1 overflow-y-auto space-y-1.5">
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Navigation Menu
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`
                  w-full flex items-center justify-between px-3.5 py-3 rounded-xl
                  text-left transition-all duration-150 group cursor-pointer
                  ${isActive 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/40 font-bold" 
                    : "text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium"
                  }
                `}
                id={`sidebar-tab-${item.id}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`
                    p-2 rounded-lg shrink-0 transition-colors
                    ${isActive ? "bg-white/20 text-white" : "bg-slate-800 text-blue-400 group-hover:bg-slate-700 group-hover:text-blue-300"}
                  `}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs tracking-tight truncate">{item.label}</div>
                    <div className={`text-[10px] truncate font-sans ${isActive ? "text-blue-100" : "text-slate-400"}`}>
                      {item.sublabel}
                    </div>
                  </div>
                </div>

                {item.badge !== undefined && (
                  <span className={`
                    px-2 py-0.5 text-[10px] font-extrabold rounded-full font-mono shrink-0 ml-1
                    ${isActive ? "bg-white/20 text-white" : "bg-blue-900/60 text-blue-300 border border-blue-700/50"}
                  `}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Profile / Sync Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-3">
          
          {/* Active User Badge */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-[11px] font-bold text-slate-300 font-mono">
                Role: <span className="text-blue-400 uppercase">{userRole}</span>
              </span>
            </div>
            
            <button
              onClick={onLogout}
              className="text-[11px] font-bold text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
              title="Logout session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>

          <div className="px-2 py-1.5 bg-slate-900 rounded-lg border border-slate-800 text-[10px] text-slate-400 flex items-center gap-2 font-mono">
            <Database className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate">{totalEntriesCount} clinic records active</span>
          </div>

        </div>

      </aside>
    </>
  );
}
