/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { 
  Database, 
  Download, 
  Upload, 
  Play, 
  RotateCcw, 
  ShieldCheck, 
  AlertTriangle,
  Server,
  LogOut,
  User,
  CheckCircle2,
  HardDrive,
  Image as ImageIcon,
  Link as LinkIcon
} from "lucide-react";
import { DEFAULT_APP_LOGO, compressAndEncodeImage } from "../lib/logoHelper";

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
  appLogo: string;
  onUpdateLogo: (newLogoUrl: string) => Promise<void>;
  onResetLogo: () => Promise<void>;
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
  onLogout,
  appLogo,
  onUpdateLogo,
  onResetLogo
}: SettingsViewProps) {
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState("");
  const [logoErrorMessage, setLogoErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setLogoErrorMessage("Please select a valid image file (PNG, JPG, SVG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setLogoErrorMessage("Image file size is too large (max 5MB). Please select an image under 5MB.");
      return;
    }

    setLogoErrorMessage(null);
    setIsUploadingLogo(true);
    try {
      const encoded = await compressAndEncodeImage(file);
      await onUpdateLogo(encoded);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: any) {
      setLogoErrorMessage(err?.message || "Failed to process and update image.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleApplyUrl = async () => {
    const url = customUrlInput.trim();
    if (!url) return;
    if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("data:image/")) {
      setLogoErrorMessage("Please enter a valid HTTP or HTTPS image URL.");
      return;
    }

    setLogoErrorMessage(null);
    setIsUploadingLogo(true);
    try {
      await onUpdateLogo(url);
      setCustomUrlInput("");
    } catch (err: any) {
      setLogoErrorMessage(err?.message || "Failed to update logo from URL.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

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
              Manage clinic logo, central cloud backups, demo records, data synchronization, and user clearance.
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

      {/* SECTION 0: Clinic Logo & Branding */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800 font-display flex items-center gap-2">
                <span>Clinic Logo & Branding</span>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 font-mono">
                  Global Sync
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Upload or update your official clinic logo. The new logo will automatically update everywhere: Header, Sidebar, Invoice/Receipt prints, Login Screen, and Footer.
              </p>
            </div>
          </div>

          {/* Reset button if not default */}
          {appLogo !== DEFAULT_APP_LOGO && (
            <button
              type="button"
              onClick={onResetLogo}
              disabled={isUploadingLogo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
              title="Revert back to the default BRG logo"
              id="setting-btn-reset-logo"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Default Logo</span>
            </button>
          )}
        </div>

        {/* Active Logo Previews + Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          
          {/* Current Logo Preview Displays */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Current Active Logo Preview
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {/* On Light Background (Header, Invoices, Login) */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 min-h-[110px]">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Light / Invoice Preview
                </span>
                <img 
                  src={appLogo} 
                  alt="Current Logo Light" 
                  className="h-10 max-w-[130px] object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* On Dark Background (Sidebar) */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 min-h-[110px]">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Dark / Sidebar Preview
                </span>
                <img 
                  src={appLogo} 
                  alt="Current Logo Dark" 
                  className="h-10 max-w-[130px] object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 italic">
              Tip: Transparent PNG or SVG images look great on both light and dark backgrounds.
            </p>
          </div>

          {/* Upload Actions & URL Input */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Upload File Box */}
            <div className="p-4 bg-blue-50/40 border border-blue-100 rounded-xl space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>Upload Logo from Device</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Supports PNG, JPG, WebP, SVG (Auto-compressed for instant loading)
                  </div>
                </div>
                
                <label 
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs transition-colors cursor-pointer shrink-0 ${
                    isUploadingLogo ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                  id="setting-lbl-upload-logo"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingLogo ? "Processing..." : "Select Logo File"}</span>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/png, image/jpeg, image/webp, image/svg+xml, image/*" 
                    onChange={handleFileChange} 
                    disabled={isUploadingLogo}
                    className="hidden" 
                    id="setting-inp-upload-logo"
                  />
                </label>
              </div>
            </div>

            {/* Or Paste URL */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
              <label htmlFor="setting-inp-logo-url" className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>Or Paste Direct Image Web URL</span>
              </label>
              <div className="flex gap-2">
                <input 
                  type="url"
                  id="setting-inp-logo-url"
                  placeholder="https://example.com/clinic-logo.png"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  disabled={isUploadingLogo}
                  className="flex-1 text-xs font-mono border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-hidden focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  disabled={!customUrlInput.trim() || isUploadingLogo}
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-xs transition-colors cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                  id="setting-btn-apply-logo-url"
                >
                  Apply URL
                </button>
              </div>
            </div>

            {/* Error / Alert banner */}
            {logoErrorMessage && (
              <div className="flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{logoErrorMessage}</span>
              </div>
            )}
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
