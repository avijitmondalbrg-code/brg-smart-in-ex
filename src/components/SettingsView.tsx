/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Database, 
  Download, 
  Upload, 
  Play, 
  RotateCcw, 
  ShieldCheck, 
  CloudCheck, 
  AlertTriangle,
  Server,
  FileSpreadsheet,
  LogOut,
  User,
  Activity,
  CheckCircle2,
  HardDrive
} from "lucide-react";

interface SettingsViewProps {
  onLoadDemo: () => void;
  onClearAll: () => void;
  onExportJSON: () => void;
  onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
  totalEntriesCount: number;
  isFirebaseConnected: boolean;
  isFirebaseSyncing: boolean;
  userRole: string;
  onLogout: () => void;
}

export default function SettingsView({
  onLoadDemo,
  onClearAll,
  onExportJSON,
  onImportJSON,
  totalEntriesCount,
  isFirebaseConnected,
  isFirebaseSyncing,
  userRole,
  onLogout
}: SettingsViewProps) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      
      {/* Settings Title Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-xs">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
                System Administration
              </span>
            </div>
            <h2 className="text-xl font-bold font-display text-slate-800">
              Database & System Settings
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Manage central cloud database backups, demo records, data synchronization, and user clearance.
            </p>
          </div>
        </div>

        {/* Live Server Status Badge */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl">
          <div className="relative flex shrink-0 h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isFirebaseSyncing ? "bg-amber-400" : isFirebaseConnected ? "bg-blue-400" : "bg-red-400"
            }`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${
              isFirebaseSyncing ? "bg-amber-500" : isFirebaseConnected ? "bg-blue-600" : "bg-red-500"
            }`}></span>
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1 font-mono">
              <span>{isFirebaseSyncing ? "Syncing..." : isFirebaseConnected ? "Central Cloud Connected" : "Offline"}</span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              {totalEntriesCount} records synced in real-time
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Settings Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* SECTION 1: Backup & Restore */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <HardDrive className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-800 font-display">Data Backup & Restore</h3>
              <p className="text-[11px] text-slate-500">Download offline JSON backups or restore previous database files.</p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {/* Export JSON */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-slate-800">Export Backup File (JSON)</div>
                <div className="text-[11px] text-slate-500">Save complete patient & ledger records locally.</div>
              </div>
              <button
                type="button"
                onClick={onExportJSON}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
                id="setting-btn-export"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            </div>

            {/* Import JSON */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-slate-800">Restore Data (JSON)</div>
                <div className="text-[11px] text-slate-500">Import records from a previously exported backup file.</div>
              </div>
              <label 
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
                id="setting-lbl-import"
              >
                <Upload className="w-3.5 h-3.5 text-slate-600" />
                <span>Restore</span>
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={onImportJSON} 
                  className="hidden" 
                />
              </label>
            </div>
          </div>
        </div>

        {/* SECTION 2: Demo & Database Management */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Server className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-800 font-display">Database Operations</h3>
              <p className="text-[11px] text-slate-500">Initialize test dataset or clear central records.</p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {/* Demo Data */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-slate-800">Load Bengal Demo Data</div>
                <div className="text-[11px] text-slate-500">Populate database with 15 sample therapy records.</div>
              </div>
              <button
                type="button"
                onClick={onLoadDemo}
                disabled={userRole !== "admin"}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                id="setting-btn-demo"
              >
                <Play className="w-3.5 h-3.5 text-blue-600" />
                <span>Load Demo</span>
              </button>
            </div>

            {/* Clear / Reset All */}
            <div className="p-3.5 bg-rose-50/50 border border-rose-100 rounded-xl flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-rose-900">Hard Reset Database</div>
                <div className="text-[11px] text-rose-600">Permanently clear all synchronized clinical records.</div>
              </div>
              <button
                type="button"
                onClick={onClearAll}
                disabled={userRole !== "admin" || totalEntriesCount === 0}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 border border-rose-200 rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                id="setting-btn-clear"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                <span>Reset All</span>
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 3: Account & Session Info */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4 md:col-span-2">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-800 font-display">Session Clearance & Security</h3>
              <p className="text-[11px] text-slate-500">Active authorization profile and session options.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">Active Role</div>
                <div className="text-sm font-extrabold text-blue-950 font-mono">{userRole.toUpperCase()}</div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Security State</div>
                <div className="text-xs font-bold text-slate-800">Authorized Session</div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Session End</div>
                <div className="text-xs font-bold text-slate-800">Sign out portal</div>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer shrink-0"
                id="setting-btn-logout"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
