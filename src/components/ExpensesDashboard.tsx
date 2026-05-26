/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { IncomeEntry, CLINIC_LOCATIONS } from "../types";
import { 
  TrendingDown, 
  Search, 
  MapPin, 
  User, 
  Filter, 
  Coins, 
  Building2, 
  FileSpreadsheet, 
  PieChart, 
  BarChart3, 
  Calendar,
  Layers,
  ArrowRight,
  Info
} from "lucide-react";

interface ExpensesDashboardProps {
  entries: IncomeEntry[];
}

const EXPENSE_CATEGORIES = [
  { key: "doctorReferral", label: "Doctor Referral Head", color: "bg-violet-500", text: "text-violet-700", ring: "ring-violet-200", border: "border-violet-100", fill: "#8b5cf6" },
  { key: "audiologistCommission", label: "ASLP (Audiologist) Comm.", color: "bg-emerald-500", text: "text-emerald-700", ring: "ring-emerald-200", border: "border-emerald-100", fill: "#10b981" },
  { key: "clinicShare", label: "Clinic Share Allocation", color: "bg-blue-500", text: "text-blue-700", ring: "ring-blue-200", border: "border-blue-100", fill: "#3b82f6" },
  { key: "anyServiceCharges", label: "Service / Fabrication Fees", color: "bg-amber-500", text: "text-amber-700", ring: "ring-amber-200", border: "border-amber-100", fill: "#f59e0b" },
  { key: "supportStaffCommission", label: "Support Staff Commission", color: "bg-teal-500", text: "text-teal-700", ring: "ring-teal-200", border: "border-teal-100", fill: "#14b8a6" },
  { key: "otherExpenses", label: "Other Operational Expenses", color: "bg-rose-500", text: "text-rose-700", ring: "ring-rose-200", border: "border-rose-100", fill: "#f43f5e" },
  { key: "brgProfit", label: "BRG Profit (Net Retention)", color: "bg-cyan-600", text: "text-cyan-800", ring: "ring-cyan-200", border: "border-cyan-100", fill: "#0891b2" }
];

export default function ExpensesDashboard({ entries }: ExpensesDashboardProps) {
  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>("All"); // "All" or a key
  const [selectedLocation, setSelectedLocation] = useState<string>("All");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Interactive hover indicator states for charts
  const [hoveredHeadKey, setHoveredHeadKey] = useState<string | null>(null);
  const [hoveredLocationKey, setHoveredLocationKey] = useState<string | null>(null);

  // Currency utility
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Convert raw entries into aggregated category distributions
  const categorySummary = useMemo(() => {
    const summary = {
      doctorReferral: 0,
      audiologistCommission: 0,
      clinicShare: 0,
      anyServiceCharges: 0,
      supportStaffCommission: 0,
      otherExpenses: 0,
      brgProfit: 0,
      totalIncome: 0,
      totalDisbursed: 0
    };

    entries.forEach((e) => {
      summary.totalIncome += e.amountCollected;
      summary.doctorReferral += e.expenses.doctorReferral || 0;
      summary.audiologistCommission += e.expenses.audiologistCommission || 0;
      summary.clinicShare += e.expenses.clinicShare || 0;
      summary.anyServiceCharges += e.expenses.anyServiceCharges || 0;
      summary.supportStaffCommission += e.expenses.supportStaffCommission || 0;
      summary.otherExpenses += e.expenses.otherExpenses || 0;
      summary.brgProfit += e.expenses.brgProfit || 0;
    });

    summary.totalDisbursed = 
      summary.doctorReferral + 
      summary.audiologistCommission + 
      summary.clinicShare + 
      summary.anyServiceCharges + 
      summary.supportStaffCommission + 
      summary.otherExpenses;

    return summary;
  }, [entries]);

  // Transform entries into specific "Expense Vouchers"
  const allVouchers = useMemo(() => {
    const list: Array<{
      id: string;
      date: string;
      billNo: string;
      patientName: string;
      patientId: string;
      clinicLocation: string;
      categoryKey: string;
      categoryLabel: string;
      amount: number;
      referredDoctor?: string;
      aslpName?: string;
      colorClass: string;
      textClass: string;
      totalCaseAmnt: number;
    }> = [];

    entries.forEach((e) => {
      EXPENSE_CATEGORIES.forEach((cat) => {
        const val = e.expenses[cat.key as keyof typeof e.expenses] || 0;
        if (val > 0) {
          list.push({
            id: `${e.id}-${cat.key}`,
            date: e.date,
            billNo: e.billNo,
            patientName: e.patientName,
            patientId: e.patientId,
            clinicLocation: e.clinicLocation,
            categoryKey: cat.key,
            categoryLabel: cat.label,
            amount: val,
            referredDoctor: e.referredDoctor,
            aslpName: e.aslpName,
            colorClass: cat.color,
            textClass: cat.text,
            totalCaseAmnt: e.amountCollected
          });
        }
      });
    });

    // Sort by Date descending
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [entries]);

  // Apply filters on vouchers list
  const filteredVouchers = useMemo(() => {
    return allVouchers.filter((v) => {
      // Category filter
      if (selectedCategory !== "All" && v.categoryKey !== selectedCategory) {
        return false;
      }
      // Location filter
      if (selectedLocation !== "All" && v.clinicLocation !== selectedLocation) {
        return false;
      }
      // Date range filters
      if (startDate && v.date < startDate) {
        return false;
      }
      if (endDate && v.date > endDate) {
        return false;
      }
      // Search term
      const trimmedSearch = searchTerm.trim();
      if (trimmedSearch) {
        const sQuery = trimmedSearch.toLowerCase();
        const matchesName = v.patientName.toLowerCase().includes(sQuery);
        const matchesId = v.patientId.toLowerCase().includes(sQuery);
        const matchesBill = v.billNo.toLowerCase().includes(sQuery);
        const matchesDoc = v.referredDoctor && v.referredDoctor.toLowerCase().includes(sQuery);
        const matchesAslp = v.aslpName && v.aslpName.toLowerCase().includes(sQuery);
        const matchesLoc = v.clinicLocation.toLowerCase().includes(sQuery);
        const matchesCat = v.categoryLabel.toLowerCase().includes(sQuery);

        if (!matchesName && !matchesId && !matchesBill && !matchesDoc && !matchesAslp && !matchesLoc && !matchesCat) {
          return false;
        }
      }
      return true;
    });
  }, [allVouchers, selectedCategory, selectedLocation, startDate, endDate, searchTerm]);

  // Aggregated filters output math
  const filteredTotals = useMemo(() => {
    let totInflow = 0;
    let totCalculated = 0;
    const idsProcessed = new Set<string>();

    filteredVouchers.forEach((v) => {
      totCalculated += v.amount;
      // Get billNo once to avoid summing same patient collected amount repeatedly
      if (!idsProcessed.has(v.billNo)) {
        totInflow += v.totalCaseAmnt;
        idsProcessed.add(v.billNo);
      }
    });

    return {
      disbursement: totCalculated,
      casesInvolved: idsProcessed.size,
      averageVoucher: filteredVouchers.length > 0 ? totCalculated / filteredVouchers.length : 0
    };
  }, [filteredVouchers]);

  // Graph 1: Location wise splits for active expense filter
  const locationGraphData = useMemo(() => {
    const locSums: Record<string, number> = {};
    CLINIC_LOCATIONS.forEach((l) => { locSums[l] = 0; });

    filteredVouchers.forEach((v) => {
      if (locSums[v.clinicLocation] !== undefined) {
        locSums[v.clinicLocation] += v.amount;
      } else {
        locSums[v.clinicLocation] = v.amount;
      }
    });

    return Object.entries(locSums)
      .map(([clinic, amount]) => ({ clinic, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredVouchers]);

  const maxLocationAmnt = useMemo(() => {
    const val = Math.max(...locationGraphData.map((d) => d.amount), 0);
    return val === 0 ? 1000 : val;
  }, [locationGraphData]);

  // Graph 2: Monthly Trends for active expense filter
  const monthlyGraphData = useMemo(() => {
    const monthSums: Record<string, number> = {};
    filteredVouchers.forEach((v) => {
      const mLabel = v.date.substring(0, 7); // YYYY-MM
      monthSums[mLabel] = (monthSums[mLabel] || 0) + v.amount;
    });

    const mNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return Object.entries(monthSums)
      .map(([key, amount]) => {
        const [year, month] = key.split("-");
        const idx = parseInt(month, 10) - 1;
        const name = `${mNames[idx] || month} ${year}`;
        return { key, name, amount };
      })
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [filteredVouchers]);

  const maxMonthValue = useMemo(() => {
    const maxVal = Math.max(...monthlyGraphData.map((m) => m.amount), 0);
    return maxVal === 0 ? 1000 : maxVal;
  }, [monthlyGraphData]);


  return (
    <div className="space-y-6">

      {/* 1. KEY ANALYTIC EXPENSE PARAMETERS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
        
        {/* Sum of all registered Outflow allocations */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs relative overflow-hidden group">
          <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 w-16 h-16 bg-slate-50 rounded-full group-hover:scale-110 transition-transform duration-300" />
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-rose-500 rounded-lg text-white">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Gross Disbursed (Operational)</p>
              <h4 className="text-xl font-extrabold text-slate-800 font-mono mt-1">
                {formatCurrency(categorySummary.totalDisbursed)}
              </h4>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 pt-2.5 border-t border-slate-100 flex justify-between">
            <span>Cumulative Outflow allocations</span>
            <span className="font-bold">{(categorySummary.totalIncome > 0 ? (categorySummary.totalDisbursed / categorySummary.totalIncome * 100) : 0).toFixed(1)}% of Inflow</span>
          </p>
        </div>

        {/* BRG Profit (Rest Retention) Portion */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs relative overflow-hidden group">
          <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 w-16 h-16 bg-emerald-50 rounded-full group-hover:scale-110 transition-transform duration-300" />
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-600 rounded-lg text-white">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">BRG Retention (Net Retention)</p>
              <h4 className="text-xl font-extrabold text-teal-800 font-mono mt-1">
                {formatCurrency(categorySummary.brgProfit)}
              </h4>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 pt-2.5 border-t border-slate-100 flex justify-between">
            <span>Corporate leftover cushion</span>
            <span className="font-bold text-teal-600">{(categorySummary.totalIncome > 0 ? (categorySummary.brgProfit / categorySummary.totalIncome * 100) : 0).toFixed(1)}% margins</span>
          </p>
        </div>

        {/* Selected Head Filtered Outflow Summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs relative overflow-hidden group col-span-1 sm:col-span-2 lg:col-span-2">
          <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 w-20 h-20 bg-amber-50 rounded-full" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-amber-500 rounded-lg text-white">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Active Filter Subtotal ({selectedCategory === "All" ? "All Heads" : EXPENSE_CATEGORIES.find(c => c.key === selectedCategory)?.label})</p>
                <h4 className="text-xl font-extrabold text-amber-800 font-mono mt-1">
                  {formatCurrency(filteredTotals.disbursement)}
                </h4>
              </div>
            </div>
            <div className="text-right sm:self-center">
              <div className="text-[11px] font-semibold text-slate-500">
                Found <span className="font-bold text-slate-700">{filteredVouchers.length}</span> dynamic allocations
              </div>
              <div className="text-[9px] font-bold text-slate-400">
                across <span className="text-slate-600">{filteredTotals.casesInvolved}</span> cases
              </div>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span>Location: <strong className="text-slate-600">{selectedLocation}</strong></span>
            <span>Avg. Allocation: <strong className="text-slate-600">{formatCurrency(filteredTotals.averageVoucher)}</strong></span>
          </div>
        </div>

      </div>

      {/* 2. ADVANCED INTERACTIVE GRAPHICAL CHART REPRESENTATIONS */}
      {entries.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
          <PieChart className="w-12 h-12 text-slate-350 mx-auto mb-2 animate-bounce" />
          <h3 className="font-bold text-sm text-slate-750">No operational records mapped yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Please register transaction receipts or load simulated records to unlock interactive graphical graphs!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT COLUMN: CATEGORY OUTFLOW BAR CHART & DYNAMIC LEGEND BREAKDOWN */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs lg:col-span-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 font-display flex items-center gap-1.5">
                    <PieChart className="w-4 h-4 text-rose-500" />
                    Overall Category Allocations (Inflows Split)
                  </h4>
                  <p className="text-[11px] text-slate-500">Relative weights of standard disbursement heads and corporate retention</p>
                </div>
              </div>

              {/* Dynamic Stacked Bar Breakdown Component */}
              <div className="space-y-4">
                <div className="h-6 w-full rounded-lg overflow-hidden flex shadow-inner bg-slate-100 relative">
                  {EXPENSE_CATEGORIES.map((cat) => {
                    const rawVal = categorySummary[cat.key as keyof typeof categorySummary] || 0;
                    const pct = categorySummary.totalIncome > 0 ? (rawVal / categorySummary.totalIncome) * 100 : 0;
                    if (pct <= 0) return null;
                    return (
                      <div
                        key={cat.key}
                        style={{ width: `${pct}%` }}
                        className={`${cat.color} transition-all duration-300 hover:brightness-95 cursor-pointer relative group`}
                        onMouseEnter={() => setHoveredHeadKey(cat.key)}
                        onMouseLeave={() => setHoveredHeadKey(null)}
                      />
                    );
                  })}
                  
                  {categorySummary.totalIncome === 0 && (
                    <div className="flex-grow bg-slate-200 flex items-center justify-center text-[10px] text-slate-400 font-bold">
                      Zero Funds Logged
                    </div>
                  )}
                </div>

                {/* Categories Table/Legend Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  {EXPENSE_CATEGORIES.map((cat) => {
                    const rawVal = categorySummary[cat.key as keyof typeof categorySummary] || 0;
                    const pct = categorySummary.totalIncome > 0 ? (rawVal / categorySummary.totalIncome) * 100 : 0;
                    const isSelected = selectedCategory === cat.key;
                    const isHovered = hoveredHeadKey === cat.key;

                    return (
                      <div 
                        key={cat.key}
                        onClick={() => setSelectedCategory(selectedCategory === cat.key ? "All" : cat.key)}
                        onMouseEnter={() => setHoveredHeadKey(cat.key)}
                        onMouseLeave={() => setHoveredHeadKey(null)}
                        className={`p-3 rounded-lg border text-left cursor-pointer transition-all duration-200 ${
                          isSelected ? "bg-slate-900 text-white border-slate-900 shadow-xs scale-[1.02]" :
                          isHovered ? "bg-slate-50 border-slate-300" :
                          "bg-slate-50/50 border-slate-200/80 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5 max-w-[80%]">
                            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cat.color} ring-2 ${isSelected ? "ring-white" : cat.ring}`} />
                            <span className="text-[10.5px] font-bold truncate leading-tight uppercase tracking-wider">
                              {cat.key === "audiologistCommission" ? "Audiologist/ASLP" : cat.key === "anyServiceCharges" ? "Service Fees" : cat.key === "supportStaffCommission" ? "Support Staff" : cat.key === "brgProfit" ? "BRG Net Profit" : cat.label.split(" ")[0]}
                            </span>
                          </div>
                          <span className={`text-[10px] font-extrabold ${isSelected ? "text-emerald-400" : "text-slate-500 font-mono"}`}>
                            {pct.toFixed(1)}%
                          </span>
                        </div>
                        <p className={`text-xs font-mono font-bold leading-tight ${isSelected ? "text-slate-200" : "text-slate-800"}`}>
                          {formatCurrency(rawVal)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="mt-4 bg-slate-50/70 border border-slate-200/60 p-3 rounded-lg flex items-start gap-2 text-[10.5px] text-slate-500">
              <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="leading-snug">
                Click any dashboard head card above to quick-filter the entire ledger instantly. Highlight sections by hovering over the master bar generator.
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: DOUBLE CHARTS STACK */}
          <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">

            {/* DYNAMIC TIMELINE TRENDS SVG GRAPH */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex-grow">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 font-display flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-emerald-600" />
                    Month-wise Allocation Trend
                  </h4>
                  <p className="text-[10.5px] text-slate-500">
                    Monthly expenditure details for: <strong className="text-slate-700">{selectedCategory === "All" ? "Combined Flows" : EXPENSE_CATEGORIES.find(c => c.key === selectedCategory)?.label}</strong>
                  </p>
                </div>
              </div>

              {monthlyGraphData.length === 0 ? (
                <div className="h-32 bg-slate-50 border border-dashed rounded-lg flex flex-col items-center justify-center text-slate-400 text-[11px] p-4 text-center">
                  <span>No monthly trends relative to filters</span>
                </div>
              ) : (
                <div className="pt-2">
                  <div className="flex items-end justify-between h-36 border-b border-slate-200 pb-1.5 px-3">
                    {monthlyGraphData.map((m) => {
                      const htPct = (m.amount / maxMonthValue) * 100;
                      return (
                        <div key={m.key} className="flex flex-col items-center group relative w-12 cursor-pointer">
                          {/* Value Badge popup on hover */}
                          <div className="absolute -top-7 scale-0 group-hover:scale-100 transition-all duration-150 bg-slate-900 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm z-30 pointer-events-none whitespace-nowrap">
                            {formatCurrency(m.amount)}
                          </div>
                          {/* Column Bar */}
                          <div 
                            style={{ height: `${Math.max(htPct, 5)}%` }} 
                            className="w-5 rounded-t bg-gradient-to-t from-emerald-600 to-teal-400 hover:from-emerald-700 hover:to-teal-500 group-hover:shadow-xs transition-all duration-150"
                          />
                          {/* Period Label */}
                          <span className="text-[10px] text-slate-400 font-mono font-bold mt-1.5 rotate-12 origin-top-left whitespace-nowrap leading-none truncate max-w-[50px]">
                            {m.name.split(" ")[0]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="h-4" /> {/* Gap for layout consistency */}
                </div>
              )}
            </div>

            {/* DYNAMIC CLINIC LOCATIONS RATIO SPLIT HORIZONTAL CHART */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 font-display flex items-center gap-1.5 font-sans">
                    <MapPin className="w-4 h-4 text-red-500" />
                    Clinic Location Disbursement Share
                  </h4>
                  <p className="text-[10.5px] text-slate-500">Contribution ratio per Center</p>
                </div>
              </div>

              {locationGraphData.filter(l => l.amount > 0).length === 0 ? (
                <div className="h-28 bg-slate-50 border border-dashed rounded-lg flex flex-col items-center justify-center text-slate-400 text-[11px] p-4 text-center">
                  <span>No location payouts detected matching filters</span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {locationGraphData
                    .filter((l) => l.amount > 0)
                    .slice(0, 4) // Show top 4 centers
                    .map((l, index) => {
                      const sharePct = (l.amount / maxLocationAmnt) * 100;
                      return (
                        <div key={l.clinic} className="space-y-1">
                          <div className="flex justify-between items-center text-[10.5px]">
                            <span className="font-bold text-slate-700 flex items-center gap-1">
                              <span className="text-[9px] text-slate-400">#{index+1}</span>
                              {l.clinic}
                            </span>
                            <span className="font-mono font-bold text-slate-900">{formatCurrency(l.amount)}</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              style={{ width: `${sharePct}%` }}
                              className="h-full bg-slate-700 rounded-full transition-all duration-300 hover:bg-slate-900 cursor-pointer"
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* 3. COMPREHENSIVE FILTER SYSTEM LEDGER SHEET */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
        
        {/* Filter and settings bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Filter Section Title */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-800 font-display uppercase tracking-wider">
                Voucher Disbursals Ledger Sheet
              </h3>
            </div>

            {/* Selection indicators */}
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono font-bold text-slate-500">
              {selectedCategory !== "All" && (
                <span className="bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span>Category: {EXPENSE_CATEGORIES.find(c => c.key === selectedCategory)?.label.split(" ")[0]}</span>
                  <button onClick={() => setSelectedCategory("All")} className="hover:text-red-600 cursor-pointer">×</button>
                </span>
              )}
              {selectedLocation !== "All" && (
                <span className="bg-blue-50 border border-blue-200 text-blue-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span>Location: {selectedLocation}</span>
                  <button onClick={() => setSelectedLocation("All")} className="hover:text-red-600 cursor-pointer">×</button>
                </span>
              )}
              {searchTerm && (
                <span className="bg-slate-100 border border-slate-300 text-slate-700 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span>Search: "{searchTerm}"</span>
                  <button onClick={() => setSearchTerm("")} className="hover:text-red-600 cursor-pointer">×</button>
                </span>
              )}
              {(startDate || endDate) && (
                <span className="bg-purple-50 border border-purple-200 text-purple-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span>Date Bounds</span>
                  <button onClick={() => { setStartDate(""); setEndDate(""); }} className="hover:text-red-600 cursor-pointer">×</button>
                </span>
              )}
              {(selectedCategory !== "All" || selectedLocation !== "All" || searchTerm || startDate || endDate) && (
                <button 
                  onClick={() => {
                    setSelectedCategory("All");
                    setSelectedLocation("All");
                    setSearchTerm("");
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded hover:bg-red-100 transition-colors mr-2 cursor-pointer"
                >
                  Clear All Filters
                </button>
              )}
            </div>

          </div>

          {/* Form input matrix row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5 mt-4">
            
            {/* Search Input bar */}
            <div className="relative md:col-span-1.5">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search Patient, Ref Dr, Bill..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-[11px] border border-slate-300 rounded-lg py-2 pl-8.5 pr-3 bg-white focus:border-emerald-500 focus:outline-hidden transition-colors"
              />
            </div>

            {/* Expense Head category filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-[11px] font-bold border border-slate-300 rounded-lg py-2 px-3 bg-white focus:border-emerald-500 focus:outline-hidden transition-colors cursor-pointer"
              >
                <option value="All">All Categories (Unified)</option>
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Clinic location filter */}
            <div>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full text-[11px] font-bold border border-slate-300 rounded-lg py-2 px-3 bg-white focus:border-emerald-500 focus:outline-hidden transition-colors cursor-pointer"
              >
                <option value="All">All Centers / Clinics</option>
                {CLINIC_LOCATIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date Bound */}
            <div className="relative">
              <span className="absolute left-3.5 top-2 py-0.5 text-[9px] uppercase tracking-wider text-slate-400 font-bold pointer-events-none">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-[11px] font-mono border border-slate-300 rounded-lg py-2 pl-12 pr-1.5 bg-white focus:border-emerald-500 focus:outline-hidden transition-colors"
              />
            </div>

            {/* End Date Bound */}
            <div className="relative">
              <span className="absolute left-3.5 top-2 py-0.5 text-[9px] uppercase tracking-wider text-slate-400 font-bold pointer-events-none">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-[11px] font-mono border border-slate-300 rounded-lg py-2 pl-9 pr-1.5 bg-white focus:border-emerald-500 focus:outline-hidden transition-colors"
              />
            </div>

          </div>
        </div>

        {/* Live filtered table sheet */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left font-sans text-[11px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-5 py-3 w-1/10 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Date
                </th>
                <th className="px-5 py-3 w-1/5">Patient ID / Billing ID</th>
                <th className="px-5 py-3 w-1/4">Expense Head Category</th>
                <th className="px-5 py-3 w-1/5">Associated Detail</th>
                <th className="px-5 py-3 w-1/6">Clinic Center</th>
                <th className="px-5 py-3 text-right">Inflow Total</th>
                <th className="px-5 py-3 text-right">Fund Outflow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium bg-white">
              {filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400 bg-slate-50/20 italic font-medium">
                    No individual expense allocations matching dynamic criteria could be located. Try adjusting filter fields or clearing limits.
                  </td>
                </tr>
              ) : (
                filteredVouchers.map((v) => {
                  return (
                    <tr key={v.id} className="hover:bg-slate-50/85 transition-colors duration-100">
                      
                      {/* Date */}
                      <td className="px-5 py-3 text-slate-500 font-mono font-semibold">
                        {v.date}
                      </td>

                      {/* ID Cards */}
                      <td className="px-5 py-3">
                        <div className="font-bold text-slate-800">{v.patientName}</div>
                        <div className="font-mono text-[9px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>{v.patientId}</span>
                          <span className="text-slate-350">•</span>
                          <span>{v.billNo}</span>
                        </div>
                      </td>

                      {/* Expense Category Tag */}
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded font-bold border ${v.colorClass} bg-opacity-10 text-[10px]`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${v.colorClass}`} />
                          {v.categoryLabel}
                        </span>
                      </td>

                      {/* Associated Personnel Details */}
                      <td className="px-5 py-3 text-slate-600 font-medium">
                        {v.categoryKey === "doctorReferral" && (
                          <div className="flex items-center gap-1 text-[10.5px]">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="text-slate-400">Dr:</span>
                            <span className="text-violet-800 font-bold bg-violet-50 px-1 py-0.5 rounded border border-violet-100">
                              {v.referredDoctor || "Self Referral/Direct"}
                            </span>
                          </div>
                        )}
                        {v.categoryKey === "audiologistCommission" && (
                          <div className="flex items-center gap-1 text-[10.5px]">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="text-slate-400">ASLP:</span>
                            <span className="text-emerald-800 font-bold bg-emerald-50 px-1 py-0.5 rounded border border-emerald-100">
                              {v.aslpName || "Staff ASLP"}
                            </span>
                          </div>
                        )}
                        {v.categoryKey === "clinicShare" && (
                          <span className="text-slate-400 font-semibold italic">Diagnostic Facilities Rent</span>
                        )}
                        {v.categoryKey === "anyServiceCharges" && (
                          <span className="text-slate-400 font-semibold italic">Lab fabrication & products</span>
                        )}
                        {v.categoryKey === "supportStaffCommission" && (
                          <span className="text-slate-400 font-semibold italic">Local support desk incentive</span>
                        )}
                        {v.categoryKey === "otherExpenses" && (
                          <span className="text-slate-400 font-semibold italic">Generic operations</span>
                        )}
                        {v.categoryKey === "brgProfit" && (
                          <span className="text-teal-700 font-bold">BRG Net retention capital</span>
                        )}
                      </td>

                      {/* Center Site */}
                      <td className="px-5 py-3 font-semibold text-slate-700">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span>{v.clinicLocation}</span>
                        </div>
                      </td>

                      {/* Raw Collected flow of the entire case */}
                      <td className="px-5 py-3 text-right font-mono font-semibold text-slate-400">
                        {formatCurrency(v.totalCaseAmnt)}
                      </td>

                      {/* Allocated Expense amount */}
                      <td className="px-5 py-3 text-right font-mono font-extrabold text-slate-800 text-[11.5px]">
                        {formatCurrency(v.amount)}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic bottom paginator/info bar summary */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-mono gap-3">
          <div>
            Showing <strong className="text-slate-700">{filteredVouchers.length}</strong> matching entries out of <strong className="text-slate-600">{allVouchers.length}</strong> total disbursement vouchers.
          </div>
          <div className="flex items-center gap-3">
            <span>Filtered Outflow: <strong className="text-rose-600 font-extrabold underline decoration-dashed">{formatCurrency(filteredTotals.disbursement)}</strong></span>
            <span className="text-slate-350">|</span>
            <span>Total Inflow (Joint): <strong className="text-slate-705 font-bold">{formatCurrency(filteredTotals.disbursement + (selectedCategory === "All" ? 0 : 0))}</strong></span>
          </div>
        </div>

      </div>

    </div>
  );
}
