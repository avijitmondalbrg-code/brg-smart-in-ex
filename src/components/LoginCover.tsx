/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Lock, 
  User, 
  ShieldAlert, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  Building2, 
  Activity, 
  TrendingDown, 
  FileSpreadsheet,
  CheckCircle2
} from "lucide-react";

interface LoginCoverProps {
  onLoginSuccess: (role: string) => void;
}

export default function LoginCover({ onLoginSuccess }: LoginCoverProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Standard high-fidelity credential check
    setTimeout(() => {
      const trimmedUser = username.trim();
      const trimmedPass = password.trim();

      let matchedRole: string | null = null;
      if (trimmedUser === "admin" && trimmedPass === "admin@2026") {
        matchedRole = "admin";
      } else if (trimmedUser.toUpperCase() === "ASLP" && trimmedPass === "Audio1234") {
        matchedRole = "ASLP";
      } else if (trimmedUser.toUpperCase() === "SUPPORT" && trimmedPass === "Support1234") {
        matchedRole = "SUPPORT";
      }

      if (matchedRole) {
        setSuccessAnimation(true);
        const roleToPass = matchedRole;
        setTimeout(() => {
          onLoginSuccess(roleToPass);
          setIsSubmitting(false);
        }, 800);
      } else {
        setError("Invalid User Credentials. Please check username & password.");
        setIsSubmitting(false);
      }
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#848688] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden selection:bg-emerald-500 selection:text-white">
      {/* Visual Background Decors */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-emerald-500/10 to-teal-500/0 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-cyan-500/10 to-indigo-500/0 blur-3xl" />
        
        {/* Subtle decorative grid overlay with low opacity for nice texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
      </div>

      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 relative z-10 animate-fadeIn duration-700">
        
        {/* LEFT COLUMN: BRANDED INFORMATION COVER SPLASH */}
        <div className="col-span-1 lg:col-span-7 bg-slate-950 p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
          
          {/* Subtle Ambient Glow on absolute corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
          
          <div className="space-y-8 relative z-10">
            {/* Corporate Logo Branding Banner */}
            <div className="flex items-center gap-3.5">
              <div className="bg-white p-2.5 rounded-2xl border border-slate-200 flex items-center justify-center shrink-0 shadow-md">
                <img 
                  src="https://www.bengalrehabilitationgroup.com/images/brg_logo.png" 
                  alt="BRG Logo" 
                  className="h-10 sm:h-12 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase leading-none bg-emerald-950/70 border border-emerald-900/60 px-2 py-0.5 rounded-full inline-block">
                  Institutional Portal
                </span>
                <h2 className="text-sm font-extrabold text-slate-300 font-display mt-1">
                  Bengal Rehabilitation Group
                </h2>
              </div>
            </div>

            {/* Premium Typography Welcome Segment */}
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight font-display">
                Smart <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">IN-EX</span> Ledger
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-md leading-relaxed">
                Welcome to Bengal Rehabilitation Group's secure Clinical Practice Incomes &amp; Operational Disbursement Allocation Management Suite. Manage financial transparency seamlessly.
              </p>
            </div>

            {/* Core Feature Pillar Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="flex gap-3 items-start p-3.5 rounded-xl bg-slate-900/50 border border-slate-850">
                <div className="p-2 bg-emerald-950 text-emerald-400 rounded-lg shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Patient Billing & Intake</h4>
                  <p className="text-[10.5px] text-slate-400 mt-1 leading-snug">Track therapy schedules, clinician assessments, and generate localized billing records.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3.5 rounded-xl bg-slate-900/50 border border-slate-850">
                <div className="p-2 bg-rose-950 text-rose-400 rounded-lg shrink-0">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Disbursement &amp; Expenses</h4>
                  <p className="text-[10.5px] text-slate-400 mt-1 leading-snug">Assign allocations dynamically for referrals, audiology commissions, and clinic share.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3.5 rounded-xl bg-slate-900/50 border border-slate-850">
                <div className="p-2 bg-cyan-950 text-cyan-400 rounded-lg shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Ledger Sheets &amp; Backups</h4>
                  <p className="text-[10.5px] text-slate-400 mt-1 leading-snug">Query statements with multi-layered filters and export JSON compliance backups instantly.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3.5 rounded-xl bg-slate-900/50 border border-slate-850">
                <div className="p-2 bg-amber-950 text-amber-400 rounded-lg shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Advanced Analytics</h4>
                  <p className="text-[10.5px] text-slate-400 mt-1 leading-snug">Visualize location revenues, caseload variations, and cumulative net retention margins.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-850/60 flex flex-wrap items-center justify-between text-[11px] text-slate-500 font-mono gap-3 relative z-10">
            <span className="flex items-center gap-1.5 text-slate-400 font-sans">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
              <span>Full local privacy mechanism active</span>
            </span>
            <span>Version 2.0 (Stable)</span>
          </div>

        </div>

        {/* RIGHT COLUMN: INTERACTIVE PREMIUM LOGIN CARD */}
        <div className="col-span-1 lg:col-span-5 p-8 sm:p-12 flex flex-col justify-center bg-slate-900/60 relative">
          
          <div className="w-full max-w-sm mx-auto space-y-6">
            
            <div className="space-y-1.5">
              <h3 className="text-xl font-bold tracking-tight text-white font-display">
                Authorized Login
              </h3>
              <p className="text-xs text-slate-400">
                Please enter your credentials below to gain secure clearance
              </p>
            </div>

            {/* Error alerts banner */}
            {error && (
              <div className="bg-rose-950/60 border border-rose-900 text-rose-200 p-3.5 rounded-xl flex items-start gap-2.5 text-[11.5px] animate-shake">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {/* Form submission matrix */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Username row */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block pl-1">
                  Username ID
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your admin ID"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-950/65 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/10 focus:outline-hidden transition-all duration-200"
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password row */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block pl-1">
                  Security Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter system password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs font-mono font-bold bg-slate-950/65 border border-slate-800 rounded-xl py-3 pl-10 pr-10 text-white focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/10 focus:outline-hidden transition-all duration-200"
                    autoComplete="current-password"
                  />
                  
                  {/* Eye Toggler */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 p-1 text-slate-500 hover:text-slate-350 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || successAnimation}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-5 text-xs font-bold text-white rounded-xl shadow-lg border outline-hidden transition-all duration-300 cursor-pointer ${
                    successAnimation
                      ? "bg-emerald-600 border-emerald-500"
                      : "bg-emerald-500 hover:bg-emerald-600 border-emerald-400 hover:shadow-emerald-500/10 hover:shadow-xl active:scale-[0.98]"
                  } disabled:opacity-75`}
                >
                  {successAnimation ? (
                    <>
                      <ShieldCheck className="w-4 h-4 animate-bounce" />
                      <span>Granting Access...</span>
                    </>
                  ) : isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Secure Login</span>
                      <ArrowRight className="w-4 h-4 font-extrabold" />
                    </>
                  )}
                </button>
              </div>

            </form>

            {/* Helpful hint footer box */}
            <div className="pt-2 text-center">
              <p className="text-[10px] text-slate-500 italic max-w-xs mx-auto leading-normal">
                Credentials assigned by default for audit &amp; testing purposes:<br />
                <span className="not-italic block mt-1 font-mono text-slate-400">
                  ID: <strong className="text-white">admin</strong> / Pass: <strong className="text-white">admin@2026</strong> (Full Access)
                </span>
                <span className="not-italic block font-mono text-slate-400">
                  ID: <strong className="text-white">ASLP</strong> / Pass: <strong className="text-white">Audio1234</strong> (No Delete / Hides Admin Tools)
                </span>
                <span className="not-italic block font-mono text-slate-400">
                  ID: <strong className="text-white">SUPPORT</strong> / Pass: <strong className="text-white">Support1234</strong> (No Delete / Hides Admin Tools)
                </span>
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
