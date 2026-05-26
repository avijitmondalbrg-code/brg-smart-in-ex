/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  IncomeEntry, 
  ExpenseDistribution 
} from "../types";
import { 
  TrendingUp, 
  DollarSign, 
  Briefcase, 
  UserSquare2, 
  Percent, 
  MapPin, 
  PieChart as PieIcon,
  ChevronsRight,
  TrendingDown,
  Info
} from "lucide-react";

interface DashboardProps {
  entries: IncomeEntry[];
}

export default function Dashboard({ entries }: DashboardProps) {
  // Aggregate calculations
  const totalIncome = entries.reduce((sum, e) => sum + e.amountCollected, 0);
  
  const totalExpenses = entries.reduce((sum, e) => {
    const ex = e.expenses;
    return sum + (
      ex.doctorReferral + 
      ex.audiologistCommission + 
      ex.clinicShare + 
      ex.anyServiceCharges + 
      ex.supportStaffCommission + 
      ex.otherExpenses +
      (ex.brgProfit || 0)
    );
  }, 0);

  const netSavings = totalIncome - totalExpenses;
  const expensePercentage = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
  const averageIncome = entries.length > 0 ? totalIncome / entries.length : 0;

  // Breakdown of individual expense heads
  const expenseBreakdown = entries.reduce(
    (acc, e) => {
      acc.doctorReferral += e.expenses.doctorReferral;
      acc.audiologistCommission += e.expenses.audiologistCommission;
      acc.clinicShare += e.expenses.clinicShare;
      acc.anyServiceCharges += e.expenses.anyServiceCharges;
      acc.supportStaffCommission += e.expenses.supportStaffCommission;
      acc.otherExpenses += e.expenses.otherExpenses;
      acc.brgProfit += e.expenses.brgProfit || 0;
      return acc;
    },
    {
      doctorReferral: 0,
      audiologistCommission: 0,
      clinicShare: 0,
      anyServiceCharges: 0,
      supportStaffCommission: 0,
      otherExpenses: 0,
      brgProfit: 0,
    }
  );

  // Aggregation by Clinic Location
  const locationStats = entries.reduce((acc, e) => {
    if (!acc[e.clinicLocation]) {
      acc[e.clinicLocation] = { income: 0, expenses: 0, count: 0 };
    }
    acc[e.clinicLocation].income += e.amountCollected;
    const ex = e.expenses;
    acc[e.clinicLocation].expenses += (
      ex.doctorReferral + 
      ex.audiologistCommission + 
      ex.clinicShare + 
      ex.anyServiceCharges + 
      ex.supportStaffCommission + 
      ex.otherExpenses +
      (ex.brgProfit || 0)
    );
    acc[e.clinicLocation].count += 1;
    return acc;
  }, {} as Record<string, { income: number; expenses: number; count: number }>);

  // Group by Month for Trend (Past 6 Months or dynamic list)
  const monthlyStats = entries.reduce((acc, e) => {
    // Expected format: YYYY-MM
    const monthKey = e.date.substring(0, 7); 
    if (!acc[monthKey]) {
      acc[monthKey] = { monthLabel: "", income: 0, expenses: 0, count: 0 };
    }
    acc[monthKey].income += e.amountCollected;
    const ex = e.expenses;
    acc[monthKey].expenses += (
      ex.doctorReferral + 
      ex.audiologistCommission + 
      ex.clinicShare + 
      ex.anyServiceCharges + 
      ex.supportStaffCommission + 
      ex.otherExpenses +
      (ex.brgProfit || 0)
    );
    acc[monthKey].count += 1;
    return acc;
  }, {} as Record<string, { monthLabel: string; income: number; expenses: number; count: number }>);

  // Format month names (e.g., "2026-05" -> "May 2026")
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formattedMonthlyData = Object.entries(monthlyStats)
    .map(([key, val]) => {
      const [year, month] = key.split("-");
      const monthIdx = parseInt(month, 10) - 1;
      const monthLabel = `${monthNames[monthIdx] || month} ${year}`;
      return {
        key,
        monthLabel,
        income: val.income,
        expenses: val.expenses,
        net: val.income - val.expenses,
        count: val.count
      };
    })
    // Sort chronologically
    .sort((a, b) => a.key.localeCompare(b.key));

  // Determine dynamic max height for SVG charts
  const maxIncomeVal = Math.max(...formattedMonthlyData.map(d => Math.max(d.income, d.expenses)), 10000);
  const [hoveredTrendIdx, setHoveredTrendIdx] = React.useState<number | null>(null);

  // Helper to format currency elegantly
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. KEY ANALYTICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Total Income Indicator */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs relative overflow-hidden group">
          <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 w-20 h-20 bg-emerald-50 rounded-full group-hover:scale-110 transition-transform duration-300" />
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-600 rounded-lg text-white relative z-10">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Income Collected</p>
              <h3 className="text-2xl sm:text-3xl font-bold font-display text-slate-800 tracking-tight mt-0.5">
                {formatCurrency(totalIncome)}
              </h3>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Total registered patients: <strong>{entries.length}</strong></span>
            <span className="bg-emerald-100/80 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
              avg. {formatCurrency(averageIncome)}/pt
            </span>
          </div>
        </div>

        {/* Total Allocated Expenses */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs relative overflow-hidden group">
          <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 w-20 h-20 bg-rose-50 rounded-full group-hover:scale-110 transition-transform duration-300" />
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-500 rounded-lg text-white relative z-10">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Disbursed Expenses</p>
              <h3 className="text-2xl sm:text-3xl font-bold font-display text-slate-800 tracking-tight mt-0.5">
                {formatCurrency(totalExpenses)}
              </h3>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Overall Expense Ratio:</span>
            <span className={`px-2 py-0.5 rounded-full font-semibold ${expensePercentage > 85 ? "bg-red-100 text-red-800" : "bg-rose-100/80 text-rose-800"}`}>
              {expensePercentage.toFixed(1)}% of income
            </span>
          </div>
        </div>

        {/* Net Savings & Clinic Retention */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs sm:col-span-2 lg:col-span-1 relative overflow-hidden group">
          <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 w-20 h-20 bg-cyan-50 rounded-full group-hover:scale-110 transition-transform duration-300" />
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-600 rounded-lg text-white relative z-10">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Remaining Net Surplus</p>
              <h3 className="text-2xl sm:text-3xl font-bold font-display text-slate-800 tracking-tight mt-0.5">
                {formatCurrency(netSavings)}
              </h3>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Clinic Retention Rate:</span>
            <span className="bg-cyan-100/80 text-cyan-800 px-2 py-0.5 rounded-full font-semibold">
              {(totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0).toFixed(1)}% retained
            </span>
          </div>
        </div>

      </div>

      {/* 2. DYNAMIC TREND CHART PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Visualization (2/3 width on large screens) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 font-display flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Monthly Fiscal Trends
                </h3>
                <p className="text-xs text-slate-500">Visualizes patient collected income and distributed heads per month</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 font-medium text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" /> Inflow
                </span>
                <span className="flex items-center gap-1.5 font-medium text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400 block" /> Outflow
                </span>
              </div>
            </div>

            {/* SVG Visual implementation */}
            {formattedMonthlyData.length === 0 ? (
              <div className="h-60 sm:h-72 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <PieIcon className="w-10 h-10 text-slate-300 animate-pulse mb-2" />
                <p className="text-xs font-semibold text-slate-600">None to visualize</p>
                <p className="text-[11px] text-slate-400 max-w-xs mt-1">Please insert fresh income recordings or use the "Load Demo Data" utility above to unlock dashboards instantly.</p>
              </div>
            ) : (
              <div className="relative">
                {/* Y-axis helper values */}
                <div className="absolute left-2 top-0 bottom-8 flex flex-col justify-between text-[10px] text-slate-400 font-mono pointer-events-none z-10">
                  <span>{formatCurrency(maxIncomeVal)}</span>
                  <span>{formatCurrency(maxIncomeVal * 0.75)}</span>
                  <span>{formatCurrency(maxIncomeVal * 0.5)}</span>
                  <span>{formatCurrency(maxIncomeVal * 0.25)}</span>
                  <span>₹0</span>
                </div>

                <div className="overflow-x-auto pb-2 scrollbar-thin">
                  <div className="min-w-[450px] pt-4 px-2">
                    <svg className="w-full h-64 sm:h-72" viewBox="0 0 500 240">
                      {/* Grid Lines */}
                      <line x1="50" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeDasharray="4 4" />
                      <line x1="50" y1="65" x2="480" y2="65" stroke="#f1f5f9" strokeDasharray="4 4" />
                      <line x1="50" y1="110" x2="480" y2="110" stroke="#f1f5f9" strokeDasharray="4 4" />
                      <line x1="50" y1="155" x2="480" y2="155" stroke="#f1f5f9" strokeDasharray="4 4" />
                      <line x1="50" y1="200" x2="480" y2="200" stroke="#e2e8f0" strokeWidth="1.5" />

                      {/* Map bars */}
                      {formattedMonthlyData.map((d, idx) => {
                        const totalColWidth = 430 / formattedMonthlyData.length;
                        const colGroupX = 50 + idx * totalColWidth + (totalColWidth - 40) / 2;
                        
                        // Calculated percentages relative to maximum value
                        const incHeight = (d.income / maxIncomeVal) * 180;
                        const expHeight = (d.expenses / maxIncomeVal) * 180;

                        // Clamp baseline
                        const incY = 200 - incHeight;
                        const expY = 200 - expHeight;

                        return (
                          <g 
                            key={d.key}
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredTrendIdx(idx)}
                            onMouseLeave={() => setHoveredTrendIdx(null)}
                          >
                            {/* Hitbox */}
                            <rect 
                              x={colGroupX - 5} 
                              y="10" 
                              width="50" 
                              height="190" 
                              fill="transparent" 
                            />

                            {/* Income Bar (Inflow) */}
                            <rect
                              x={colGroupX}
                              y={incY}
                              width="16"
                              height={Math.max(incHeight, 2)}
                              rx="3"
                              fill="#10b981"
                              className="transition-all duration-300 hover:fill-emerald-600"
                            />

                            {/* Expense Bar (Outflow) */}
                            <rect
                              x={colGroupX + 20}
                              y={expY}
                              width="16"
                              height={Math.max(expHeight, 2)}
                              rx="3"
                              fill="#f43f5e"
                              className="transition-all duration-300 hover:fill-rose-600"
                            />

                            {/* Highlight guide */}
                            {hoveredTrendIdx === idx && (
                              <rect 
                                x={colGroupX - 8} 
                                y="15" 
                                width="56" 
                                height="188" 
                                fill="#f1f5f9" 
                                opacity="0.3" 
                                rx="4"
                                stroke="#cbd5e1"
                                strokeWidth="0.5"
                                strokeDasharray="2 2"
                              />
                            )}

                            {/* Label on X-Axis */}
                            <text
                              x={colGroupX + 18}
                              y="218"
                              textAnchor="middle"
                              fill="#64748b"
                              className="text-[10px] sm:text-[11px] font-medium"
                            >
                              {d.monthLabel.split(" ")[0]}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>

                {/* Interactive Tooltip representation */}
                {hoveredTrendIdx !== null && formattedMonthlyData[hoveredTrendIdx] && (
                  <div className="absolute top-2 right-2 bg-slate-850 text-white rounded-lg p-3 text-xs shadow-lg max-w-xs border border-slate-700 animate-fadeIn font-sans z-20">
                    <p className="font-bold border-b border-slate-700 pb-1.5 mb-1.5 text-slate-200">
                      {formattedMonthlyData[hoveredTrendIdx].monthLabel}
                    </p>
                    <div className="space-y-1">
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400">Total Inflow:</span>
                        <span className="font-bold text-emerald-400 font-mono">
                          {formatCurrency(formattedMonthlyData[hoveredTrendIdx].income)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400">Total Outflow:</span>
                        <span className="font-bold text-rose-400 font-mono">
                          {formatCurrency(formattedMonthlyData[hoveredTrendIdx].expenses)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4 border-t border-slate-700/50 pt-1 mt-1 font-semibold">
                        <span className="text-slate-200">Net Surplus:</span>
                        <span className={`font-mono ${formattedMonthlyData[hoveredTrendIdx].net >= 0 ? "text-cyan-400" : "text-red-400"}`}>
                          {formatCurrency(formattedMonthlyData[hoveredTrendIdx].net)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 mt-4 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
              <strong>Tip:</strong> Hover over the trend bars or tap them to evaluate precise monthly comparisons. Outflows represent custom allocated fees, clinic operational share, audiologist commissions, and services charges mapped on patient entries.
            </p>
          </div>
        </div>

        {/* Expense Allocations (1/3 width on large screens) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 font-display flex items-center gap-1.5 border-b border-slate-100 pb-3 mb-4">
              <PieIcon className="w-4 h-4 text-rose-500" />
              Expense Distribution Stream
            </h3>

            {/* Bar stacks mapping overall distributed coins */}
            {totalExpenses === 0 ? (
              <div className="h-60 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <PieIcon className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-500">No expense records found</p>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Doctor Referral */}
                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span className="font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-violet-500" />
                      1. Doctor Referral
                    </span>
                    <span className="font-mono">{formatCurrency(expenseBreakdown.doctorReferral)} ({((expenseBreakdown.doctorReferral / totalExpenses) * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-violet-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${(expenseBreakdown.doctorReferral / totalExpenses) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Audiologist Commission */}
                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span className="font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      2. Audiologist Commission
                    </span>
                    <span className="font-mono">{formatCurrency(expenseBreakdown.audiologistCommission)} ({((expenseBreakdown.audiologistCommission / totalExpenses) * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${(expenseBreakdown.audiologistCommission / totalExpenses) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Clinic Share */}
                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span className="font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      3. Clinic Share
                    </span>
                    <span className="font-mono">{formatCurrency(expenseBreakdown.clinicShare)} ({((expenseBreakdown.clinicShare / totalExpenses) * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${(expenseBreakdown.clinicShare / totalExpenses) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Service Charges */}
                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span className="font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      4. Any Service Charges
                    </span>
                    <span className="font-mono">{formatCurrency(expenseBreakdown.anyServiceCharges)} ({((expenseBreakdown.anyServiceCharges / totalExpenses) * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${(expenseBreakdown.anyServiceCharges / totalExpenses) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Support Staff commission */}
                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span className="font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      5. Support Staff Commission
                    </span>
                    <span className="font-mono">{formatCurrency(expenseBreakdown.supportStaffCommission)} ({((expenseBreakdown.supportStaffCommission / totalExpenses) * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${(expenseBreakdown.supportStaffCommission / totalExpenses) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Other Expenses */}
                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span className="font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-500" />
                      6. Other Expenses
                    </span>
                    <span className="font-mono">{formatCurrency(expenseBreakdown.otherExpenses)} ({((expenseBreakdown.otherExpenses / totalExpenses) * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-slate-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${(expenseBreakdown.otherExpenses / totalExpenses) * 100}%` }}
                    />
                  </div>
                </div>

                {/* BRG Profit */}
                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span className="font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-500" />
                      7. BRG Profit
                    </span>
                    <span className="font-mono">{formatCurrency(expenseBreakdown.brgProfit || 0)} ({(( (expenseBreakdown.brgProfit || 0) / totalExpenses) * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-teal-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${((expenseBreakdown.brgProfit || 0) / totalExpenses) * 100}%` }}
                    />
                  </div>
                </div>

              </div>
            )}
          </div>

          <div className="mt-4 border-t border-slate-100 pt-4">
            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs font-semibold text-slate-700">
              <span>Total Disbursed Balance:</span>
              <span className="font-mono text-rose-600 font-bold">{formatCurrency(totalExpenses)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. CLINIC LOCATIONS SPLIT TABLE */}
      {entries.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-base font-bold text-slate-800 font-display flex items-center gap-1.5 border-b border-slate-100 pb-3 mb-4">
            <MapPin className="w-4 h-4 text-emerald-600" />
            Clinic Center Analytics
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                  <th className="py-2.5 px-3">Clinic Location</th>
                  <th className="py-2.5 px-3 text-center">Registrations</th>
                  <th className="py-2.5 px-3 text-right">Inflow (Income)</th>
                  <th className="py-2.5 px-3 text-right">Outflow (Allocated)</th>
                  <th className="py-2.5 px-3 text-right">Clinic Retention Surplus</th>
                  <th className="py-2.5 px-3 text-right">Utilization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {Object.entries(locationStats).map(([locName, stats]) => {
                  const locationSurplus = stats.income - stats.expenses;
                  const utilizationPct = stats.income > 0 ? (stats.expenses / stats.income) * 100 : 0;
                  return (
                    <tr key={locName} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-800 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-teal-500" />
                        {locName}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-500">{stats.count} cases</td>
                      <td className="py-3 px-3 text-right text-emerald-700 font-mono font-bold">{formatCurrency(stats.income)}</td>
                      <td className="py-3 px-3 text-right text-rose-600 font-mono font-bold">{formatCurrency(stats.expenses)}</td>
                      <td className={`py-3 px-3 text-right font-mono font-bold ${locationSurplus >= 0 ? "text-slate-800" : "text-red-700"}`}>
                        {formatCurrency(locationSurplus)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${utilizationPct > 85 ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"}`}>
                          {utilizationPct.toFixed(0)}% expenses
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
