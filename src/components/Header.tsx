/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  BriefcaseMedical, 
  Download, 
  Upload, 
  Play, 
  Clock, 
  RotateCcw,
  BookOpen,
  LogOut
} from "lucide-react";

interface HeaderProps {
  onLoadDemo: () => void;
  onClearAll: () => void;
  onExportJSON: () => void;
  onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
  totalEntriesCount: number;
  onLogout?: () => void;
  userRole?: string;
}

export default function Header({ 
  onLoadDemo, 
  onClearAll, 
  onExportJSON, 
  onImportJSON,
  totalEntriesCount,
  onLogout,
  userRole = "admin"
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
      // Fallback if formatting doesn't support Kolkata timezone locally
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
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100 flex items-center justify-center shrink-0">
              <img 
                src="https://www.bengalrehabilitationgroup.com/images/brg_logo.png" 
                alt="BRG Logo" 
                className="h-10 sm:h-12 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold font-display px-2 py-0.5 rounded-full border border-emerald-100">
                  Smart IN-EX v2.0
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-slate-800 flex items-center gap-1.5">
                BRG Smart IN-EX
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Bengal Rehabilitation Group • Financial Management System
              </p>
            </div>
          </div>

          {/* Quick Metrics and Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Active User Label Badge */}
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/60 rounded-lg px-3 py-1.5 text-xs text-emerald-800 font-extrabold select-none">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse block"></span>
              <span className="font-sans">Role: <span className="text-emerald-700 font-mono text-[11px] tracking-wide font-extrabold">{userRole.toUpperCase()}</span></span>
            </div>

            {/* Live Clock / User info */}
            <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{liveTime}</span>
            </div>

            {/* Backups & Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto mt-1 sm:mt-0">
              {userRole === "admin" && totalEntriesCount === 0 && (
                <button
                  type="button"
                  onClick={onLoadDemo}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors cursor-pointer"
                  title="Populate test clinical data to test indicators instantly"
                  id="btn-load-demo"
                >
                  <Play className="w-4 h-4 text-teal-600" />
                  <span>Load Demo Data</span>
                </button>
              )}

              {userRole === "admin" && totalEntriesCount > 0 && (
                <button
                  type="button"
                  onClick={onClearAll}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer"
                  title="Reset all trackers"
                  id="btn-clear-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}

              {userRole === "admin" && (
                <>
                  <button
                    type="button"
                    onClick={onExportJSON}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                    title="Backup records as JSON"
                    id="btn-export-json"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden md:inline">Download Backup</span>
                  </button>

                  <label 
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                    title="Upload previous backup file"
                    id="lbl-import-json"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden md:inline">Restore</span>
                    <input 
                      type="file" 
                      accept=".json" 
                      onChange={onImportJSON} 
                      className="hidden" 
                    />
                  </label>
                </>
              )}

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-750 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                  title="Sign out of system securely"
                  id="btn-logout"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
