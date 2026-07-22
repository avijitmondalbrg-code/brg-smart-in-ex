/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  IncomeEntry, 
  CLINIC_LOCATIONS, 
  SERVICE_TYPES, 
  PAYMENT_MODES,
  ExpenseDistribution
} from "../types";
import { 
  Search, 
  MapPin, 
  Filter, 
  Trash2, 
  Edit3, 
  Printer, 
  ChevronDown, 
  ChevronUp, 
  FileSpreadsheet, 
  ArrowUpDown, 
  CreditCard,
  BriefcaseMedical,
  Calendar,
  AlertCircle,
  Save,
  Check,
  X as XIcon
} from "lucide-react";

interface TransactionsTableProps {
  entries: IncomeEntry[];
  onEdit: (entry: IncomeEntry) => void;
  onDelete: (id: string) => void;
  onOpenReceipt: (entry: IncomeEntry) => void;
  onUpdateExpenses?: (id: string, expenses: ExpenseDistribution) => void;
  userRole?: string;
}

type SortField = "date" | "amountCollected" | "patientName";
type SortOrder = "asc" | "desc";

export default function TransactionsTable({ 
  entries, 
  onEdit, 
  onDelete, 
  onOpenReceipt,
  onUpdateExpenses,
  userRole = "admin"
}: TransactionsTableProps) {
  // Query Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedService, setSelectedService] = useState("All");
  const [selectedPaymentMode, setSelectedPaymentMode] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Inline Expense Allocations Editing State
  const [editingExpensesId, setEditingExpensesId] = useState<string | null>(null);
  const [editDoc, setEditDoc] = useState(0);
  const [editAudio, setEditAudio] = useState(0);
  const [editClinic, setEditClinic] = useState(0);
  const [editService, setEditService] = useState(0);
  const [editStaff, setEditStaff] = useState(0);
  const [editOther, setEditOther] = useState(0);

  const startEditExpenses = (entry: IncomeEntry) => {
    setEditingExpensesId(entry.id);
    setEditDoc(entry.expenses.doctorReferral);
    setEditAudio(entry.expenses.audiologistCommission);
    setEditClinic(entry.expenses.clinicShare);
    setEditService(entry.expenses.anyServiceCharges);
    setEditStaff(entry.expenses.supportStaffCommission);
    setEditOther(entry.expenses.otherExpenses);
  };
  
  // Sort States
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Accordion Details toggles (keeps track of expanded indexes)
  const [expandedRowIds, setExpandedRowIds] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRowIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Reset Filters helper
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedLocation("All");
    setSelectedService("All");
    setSelectedPaymentMode("All");
    setStartDate("");
    setEndDate("");
  };

  // Filter logic
  const filteredEntries = entries.filter((e) => {
    const matchesSearch = 
      e.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.billNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.notes && e.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesLoc = selectedLocation === "All" || e.clinicLocation === selectedLocation;
    const matchesService = selectedService === "All" || e.serviceType === selectedService;
    const matchesPay = selectedPaymentMode === "All" || e.paymentMode === selectedPaymentMode;
    const matchesStart = !startDate || e.date >= startDate;
    const matchesEnd = !endDate || e.date <= endDate;

    return matchesSearch && matchesLoc && matchesService && matchesPay && matchesStart && matchesEnd;
  });

  const downloadLedgerCSV = () => {
    // Generate headers
    const cols = [
      "Date", "Patient ID", "Patient Name", "Bill No", "Service Type", 
      "Clinic Location", "Payment Mode", "Gross Fee (INR)", "Discount (INR)", "Net Collected (INR)", 
      "Referred Doctor", "ASLP (Audiologist)", "Doc Referral Alloc (INR)", "ASLP Commission (INR)", 
      "Clinic Share (INR)", "Service/Fabrication Fees (INR)", "Support Staff Commission (INR)", 
      "Other Expenses (INR)", "BRG Profit (INR)", "Created Time", "Notes"
    ];
    
    // Rows
    const rows = sortedEntries.map(e => [
      e.date,
      e.patientId,
      `"${e.patientName.replace(/"/g, '""')}"`,
      e.billNo,
      `"${e.serviceType.replace(/"/g, '""')}"`,
      `"${e.clinicLocation.replace(/"/g, '""')}"`,
      e.paymentMode,
      e.amountCollected + (e.discount || 0), // Gross Fee
      e.discount || 0, // Discount
      e.amountCollected, // Net Collected
      `"${(e.referredDoctor || "").replace(/"/g, '""')}"`,
      `"${(e.aslpName || "").replace(/"/g, '""')}"`,
      e.expenses.doctorReferral,
      e.expenses.audiologistCommission,
      e.expenses.clinicShare,
      e.expenses.anyServiceCharges,
      e.expenses.supportStaffCommission,
      e.expenses.otherExpenses,
      e.expenses.brgProfit || 0,
      e.createdTime,
      `"${(e.notes || "").replace(/"/g, '""').replace(/\n/g, ' ')}"`
    ]);

    // Construct CSV
    const csvContent = [
      cols.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    // Download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `patient_ledger_report_${startDate || "all"}_to_${endDate || "all"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sorting logic
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    let multiplier = sortOrder === "asc" ? 1 : -1;
    if (sortField === "amountCollected") {
      return (a.amountCollected - b.amountCollected) * multiplier;
    }
    if (sortField === "patientName") {
      return a.patientName.localeCompare(b.patientName) * multiplier;
    }
    // Default sorting based on date
    return a.date.localeCompare(b.date) * multiplier;
  });

  // Calculate quick summary totals for active filtered set
  const filteredIncomeSum = filteredEntries.reduce((sum, e) => sum + e.amountCollected, 0);
  const filteredExpensesSum = filteredEntries.reduce((sum, e) => {
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

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amt);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      
      {/* Search and Filters Layout */}
      <div className="no-print p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <h3 className="text-base font-bold text-slate-800 font-display flex items-center gap-2">
              <Filter className="w-4.5 h-4.5 text-teal-600" />
              Patient Ledger & Financial Directory
            </h3>
            <p className="text-xs text-slate-500">Query transactions, view expense distributions of individual patients, or print invoices</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs self-start sm:self-auto">
            <div className="flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-xs font-mono border-none outline-hidden focus:outline-hidden p-0 w-[105px] h-auto bg-transparent focus:ring-0"
              />
            </div>
            <div className="flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-xs font-mono border-none outline-hidden focus:outline-hidden p-0 w-[105px] h-auto bg-transparent focus:ring-0"
              />
            </div>
            <button
              onClick={downloadLedgerCSV}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-[30px] px-3 py-1 rounded-lg transition-colors cursor-pointer shadow-xs border border-emerald-700/10"
              title="Download Date-Wise Patient Ledger CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <span className="bg-teal-50 text-teal-800 font-bold px-2 py-1.5 rounded border border-teal-100">
              {filteredEntries.length} Records
            </span>
            {(searchTerm || selectedLocation !== "All" || selectedService !== "All" || selectedPaymentMode !== "All" || startDate || endDate) && (
              <button 
                onClick={handleResetFilters}
                className="text-slate-500 hover:text-slate-700 bg-white border border-slate-200 font-semibold px-2 py-1.5 rounded transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Plain Text search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Name, Pt ID, Bill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs font-semibold border border-slate-300 rounded-lg py-2.5 pl-9 pr-3 bg-white focus:border-teal-500 focus:outline-hidden transition-colors"
              id="inp-search-bar"
            />
          </div>

          {/* Location filter */}
          <div>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full text-xs font-semibold border border-slate-300 rounded-lg py-2.5 px-3 bg-white focus:border-teal-500 focus:outline-hidden transition-colors cursor-pointer"
              id="filter-location"
            >
              <option value="All">All Clinic Locations</option>
              {CLINIC_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Service Category filter */}
          <div>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full text-xs font-semibold border border-slate-300 rounded-lg py-2.5 px-3 bg-white focus:border-teal-500 focus:outline-hidden transition-colors cursor-pointer"
              id="filter-service"
            >
              <option value="All">All Service Categories</option>
              {Array.from(new Set(SERVICE_TYPES)).map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Payment Mode filter */}
          <div>
            <select
              value={selectedPaymentMode}
              onChange={(e) => setSelectedPaymentMode(e.target.value)}
              className="w-full text-xs font-semibold border border-slate-300 rounded-lg py-2.5 px-3 bg-white focus:border-teal-500 focus:outline-hidden transition-colors cursor-pointer"
              id="filter-payment"
            >
              <option value="All">All Payment Modes</option>
              {PAYMENT_MODES.map((mode) => (
                <option key={mode} value={mode}>{mode}</option>
              ))}
            </select>
          </div>



        </div>

        {/* Dynamic Cumulative Filter Metrics info banner */}
        {entries.length > 0 && (
          <div className="bg-slate-100 border border-slate-200/60 p-3 rounded-lg text-xs flex flex-wrap items-center justify-between gap-4 font-semibold text-slate-700">
            <span className="text-slate-500">Filtered Set Totals:</span>
            <div className="flex gap-4">
              <span>Income: <strong className="text-emerald-700 font-mono text-[13px]">{formatCurrency(filteredIncomeSum)}</strong></span>
              <span>Allocated Expenses: <strong className="text-rose-600 font-mono text-[13px]">{formatCurrency(filteredExpensesSum)}</strong></span>
              <span>Net Retention: <strong className="text-cyan-700 font-mono text-[13px]">{formatCurrency(filteredIncomeSum - filteredExpensesSum)}</strong></span>
            </div>
          </div>
        )}

      </div>

      {/* Main Records List / Table */}
      {sortedEntries.length === 0 ? (
        <div className="p-12 text-center text-slate-500">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2.5 animate-pulse" />
          <p className="text-sm font-bold text-slate-700">No Transactions Found</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">There are no records matching your active filters. Try clearing search fields or add a fresh medical collection.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* DESKTOP TABLE */}
          <table className="hidden md:table w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-bold tracking-wider">
                <th className="py-3 px-4 w-8"></th>
                <th className="py-3 px-4 cursor-pointer hover:text-slate-600 transition-colors" onClick={() => handleSort("patientName")}>
                  Patient Info <ArrowUpDown className="w-3 h-3 inline-block ml-1" />
                </th>
                <th className="py-3 px-4">Bill No</th>
                <th className="py-3 px-4 cursor-pointer hover:text-slate-600 transition-colors" onClick={() => handleSort("date")}>
                  Service Date <ArrowUpDown className="w-3 h-3 inline-block ml-1" />
                </th>
                <th className="py-3 px-4">Clinic / Service</th>
                <th className="py-3 px-4 text-right cursor-pointer hover:text-slate-600 transition-colors" onClick={() => handleSort("amountCollected")}>
                  Amount <ArrowUpDown className="w-3 h-3 inline-block ml-1" />
                </th>
                <th className="py-3 px-4">Payment Mode</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700 font-medium">
              {sortedEntries.map((e) => {
                const isExpanded = !!expandedRowIds[e.id];
                const liveBrgProfit = e.amountCollected - (editDoc + editAudio + editClinic + editService + editStaff + editOther);
                const totalRowExpense = 
                  e.expenses.doctorReferral + 
                  e.expenses.audiologistCommission + 
                  e.expenses.clinicShare + 
                  e.expenses.anyServiceCharges + 
                  e.expenses.supportStaffCommission + 
                  e.expenses.otherExpenses +
                  (e.expenses.brgProfit || 0);

                return (
                  <React.Fragment key={e.id}>
                    <tr className={`hover:bg-slate-50/70 border-l-4 transition-colors ${isExpanded ? "border-teal-500 bg-slate-50/40" : "border-transparent"}`}>
                      {/* Accordion toggle btn */}
                      <td className="py-3.5 px-3 text-center">
                        <button 
                          onClick={() => toggleRow(e.id)} 
                          className="p-1 rounded-full hover:bg-slate-200/80 transition-colors text-slate-400 hover:text-slate-700 cursor-pointer"
                          title="Toggle expense allocation details"
                          id={`btn-toggle-row-${e.id}`}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>

                      {/* Patient Name / ID */}
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-bold text-slate-800 text-[13px]">{e.patientName}</p>
                          <p className="font-mono text-[10px] text-slate-400 font-semibold">{e.patientId}</p>
                          {e.referredDoctor && (
                            <p className="text-[10.5px] text-teal-600 font-medium">Dr: {e.referredDoctor}</p>
                          )}
                        </div>
                      </td>

                      {/* Bill No */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center bg-teal-50 text-teal-800 px-2 py-1 rounded font-bold font-mono text-[11px] border border-teal-105 shadow-2xs select-all">
                          {e.billNo}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 font-semibold text-slate-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {e.date}
                        </span>
                        {e.paymentDate === "Pending" ? (
                          <div className="mt-1">
                            <span className="inline-flex items-center gap-1 text-[9px] bg-amber-50 text-amber-700 font-extrabold px-1.5 py-0.5 rounded border border-amber-200 animate-pulse select-none">
                              <span className="h-1.5 w-1.5 bg-amber-500 rounded-full"></span> Unpaid / Pending
                            </span>
                          </div>
                        ) : e.paymentDate && e.paymentDate !== e.date ? (
                          <p className="text-[9px] text-indigo-500 font-semibold mt-1">Paid: <span className="font-mono">{e.paymentDate}</span></p>
                        ) : null}
                      </td>

                      {/* Clinic / Service */}
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="text-[11px] font-bold text-slate-600">{e.clinicLocation}</p>
                          <p className="text-[10px] text-slate-400 max-w-xs truncate">{e.serviceType}</p>
                        </div>
                      </td>

                      {/* Amount Collected */}
                      <td className="py-3.5 px-4 text-right">
                        <p className="font-mono font-extrabold text-slate-800 text-[13px]">
                          {formatCurrency(e.amountCollected)}
                        </p>
                        <p className="text-[10px] text-rose-500 font-mono font-semibold">
                          Expenses: {formatCurrency(totalRowExpense)}
                        </p>
                      </td>

                      {/* Payment mode */}
                      <td className="py-3.5 px-4 font-semibold">
                        <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded-full text-[10px] text-slate-600">
                          <CreditCard className="w-2.5 h-2.5 text-slate-400" />
                          {e.paymentMode}
                        </span>
                      </td>

                      {/* Row Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          
                          {/* Print Receipts */}
                          <button
                            onClick={() => onOpenReceipt(e)}
                            className="p-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 rounded-md transition-all cursor-pointer"
                            title="Generate print slip Invoice"
                            id={`btn-print-${e.id}`}
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => onEdit(e)}
                            className="p-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-md transition-all cursor-pointer"
                            title="Edit Patient Statement"
                            id={`btn-edit-${e.id}`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          {userRole === "admin" && (
                            <button
                              onClick={() => onDelete(e.id)}
                              className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-md transition-all cursor-pointer"
                              title="Delete permanently"
                              id={`btn-delete-${e.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                        </div>
                      </td>
                    </tr>

                    {/* EXPANDED DETAILED EXPENSE VIEW */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={7} className="bg-slate-50/70 p-4 border-l-4 border-teal-500">
                          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs animate-fadeIn max-w-4xl">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-2 mb-3.5 gap-2">
                              <div>
                                <p className="text-xs font-bold text-slate-800 font-display">
                                  Expense Distribution breakdown for {e.patientName} (Bill No: <span className="font-mono text-slate-500">{e.billNo}</span>)
                                </p>
                                <p className="text-[10px] text-slate-400">Represents how the amount collected has been dispatched across clinical structures</p>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] font-mono font-semibold text-slate-500">
                                {editingExpensesId === e.id ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-500 font-bold">Live Profit Math:</span>
                                    <span className={`px-2 py-0.5 rounded font-bold ${liveBrgProfit >= 0 ? "bg-teal-50 text-teal-700 border border-teal-100" : "bg-rose-50 text-rose-700 border border-rose-100"}`}>
                                      BRG Profit: {formatCurrency(liveBrgProfit)}
                                    </span>
                                    <button
                                      onClick={() => {
                                        if (onUpdateExpenses) {
                                          onUpdateExpenses(e.id, {
                                            doctorReferral: editDoc,
                                            audiologistCommission: editAudio,
                                            clinicShare: editClinic,
                                            anyServiceCharges: editService,
                                            supportStaffCommission: editStaff,
                                            otherExpenses: editOther,
                                            brgProfit: liveBrgProfit
                                          });
                                        }
                                        setEditingExpensesId(null);
                                      }}
                                      className="ml-2 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded flex items-center gap-1 cursor-pointer transition-colors"
                                    >
                                      <Check className="w-3 h-3" />
                                      <span>Save</span>
                                    </button>
                                    <button
                                      onClick={() => setEditingExpensesId(null)}
                                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px] rounded border border-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
                                    >
                                      <XIcon className="w-3 h-3" />
                                      <span>Cancel</span>
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <span>Total Outflow Allocation: <span className="text-rose-600 font-bold">{formatCurrency(totalRowExpense)}</span></span>
                                    <button
                                      onClick={() => startEditExpenses(e)}
                                      className="ml-3 px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-bold rounded flex items-center gap-1 cursor-pointer transition-all duration-150"
                                      id={`btn-edit-alloc-${e.id}`}
                                    >
                                      <Edit3 className="w-3 h-3" />
                                      <span>Modify Outflow Allocations</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Expense Head cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                              
                              {/* Dr Referral */}
                              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center flex flex-col justify-between">
                                <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">1. Dr Referral</p>
                                {editingExpensesId === e.id ? (
                                  <input
                                    type="number"
                                    min="0"
                                    value={editDoc}
                                    onChange={(e) => setEditDoc(Math.max(0, parseInt(e.target.value, 10) || 0))}
                                    className="w-full text-center text-xs font-mono font-bold py-1 border border-slate-300 rounded bg-white mt-1 px-1 focus:border-amber-500 focus:outline-hidden"
                                  />
                                ) : (
                                  <p className="text-xs font-semibold font-mono text-slate-800 mt-1">{formatCurrency(e.expenses.doctorReferral)}</p>
                                )}
                              </div>

                              {/* Audiologist */}
                              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center flex flex-col justify-between">
                                <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">2. Audiologist</p>
                                {editingExpensesId === e.id ? (
                                  <input
                                    type="number"
                                    min="0"
                                    value={editAudio}
                                    onChange={(e) => setEditAudio(Math.max(0, parseInt(e.target.value, 10) || 0))}
                                    className="w-full text-center text-xs font-mono font-bold py-1 border border-slate-300 rounded bg-white mt-1 px-1 focus:border-amber-500 focus:outline-hidden"
                                  />
                                ) : (
                                  <p className="text-xs font-semibold font-mono text-slate-800 mt-1">{formatCurrency(e.expenses.audiologistCommission)}</p>
                                )}
                              </div>

                              {/* Clinic Share */}
                              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center flex flex-col justify-between">
                                <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">3. Clinic Share</p>
                                {editingExpensesId === e.id ? (
                                  <input
                                    type="number"
                                    min="0"
                                    value={editClinic}
                                    onChange={(e) => setEditClinic(Math.max(0, parseInt(e.target.value, 10) || 0))}
                                    className="w-full text-center text-xs font-mono font-bold py-1 border border-slate-300 rounded bg-white mt-1 px-1 focus:border-amber-500 focus:outline-hidden"
                                  />
                                ) : (
                                  <p className="text-xs font-semibold font-mono text-slate-800 mt-1">{formatCurrency(e.expenses.clinicShare)}</p>
                                )}
                              </div>

                              {/* Service Fee */}
                              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center flex flex-col justify-between">
                                <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">4. Service Fee</p>
                                {editingExpensesId === e.id ? (
                                  <input
                                    type="number"
                                    min="0"
                                    value={editService}
                                    onChange={(e) => setEditService(Math.max(0, parseInt(e.target.value, 10) || 0))}
                                    className="w-full text-center text-xs font-mono font-bold py-1 border border-slate-300 rounded bg-white mt-1 px-1 focus:border-amber-500 focus:outline-hidden"
                                  />
                                ) : (
                                  <p className="text-xs font-semibold font-mono text-slate-800 mt-1">{formatCurrency(e.expenses.anyServiceCharges)}</p>
                                )}
                              </div>

                              {/* Support Staff Comm */}
                              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center flex flex-col justify-between">
                                <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">5. Staff Comm.</p>
                                {editingExpensesId === e.id ? (
                                  <input
                                    type="number"
                                    min="0"
                                    value={editStaff}
                                    onChange={(e) => setEditStaff(Math.max(0, parseInt(e.target.value, 10) || 0))}
                                    className="w-full text-center text-xs font-mono font-bold py-1 border border-slate-300 rounded bg-white mt-1 px-1 focus:border-amber-500 focus:outline-hidden"
                                  />
                                ) : (
                                  <p className="text-xs font-semibold font-mono text-slate-800 mt-1">{formatCurrency(e.expenses.supportStaffCommission)}</p>
                                )}
                              </div>

                              {/* Other Expenses */}
                              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center flex flex-col justify-between">
                                <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">6. Other Exp</p>
                                {editingExpensesId === e.id ? (
                                  <input
                                    type="number"
                                    min="0"
                                    value={editOther}
                                    onChange={(e) => setEditOther(Math.max(0, parseInt(e.target.value, 10) || 0))}
                                    className="w-full text-center text-xs font-mono font-bold py-1 border border-slate-300 rounded bg-white mt-1 px-1 focus:border-amber-500 focus:outline-hidden"
                                  />
                                ) : (
                                  <p className="text-xs font-semibold font-mono text-slate-800 mt-1">{formatCurrency(e.expenses.otherExpenses)}</p>
                                )}
                              </div>

                              {/* BRG Profit (Net Retention) */}
                              <div className={`p-2.5 rounded-lg border text-center flex flex-col justify-between transition-colors duration-150 ${editingExpensesId === e.id ? (liveBrgProfit >= 0 ? "bg-teal-50 border-teal-200" : "bg-rose-50 border-rose-200") : "bg-slate-50 border-slate-200"}`}>
                                <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">7. BRG Profit</p>
                                <p className={`text-xs font-mono font-extrabold mt-1.5 ${editingExpensesId === e.id ? (liveBrgProfit >= 0 ? "text-teal-700" : "text-rose-700") : "text-slate-800"}`}>
                                  {formatCurrency(editingExpensesId === e.id ? liveBrgProfit : (e.expenses.brgProfit || 0))}
                                </p>
                              </div>

                            </div>

                            {/* Supplementary Notes if they exist */}
                            {e.notes && (
                              <div className="mt-3.5 bg-teal-50/50 border border-teal-100 p-2.5 rounded-lg text-[11px] text-teal-800 italic leading-relaxed">
                                <strong>Remarks:</strong> "{e.notes}"
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          {/* MOBILE RESPONSIVE CARDS VIEW */}
          <div className="md:hidden divide-y divide-slate-100 font-sans">
            {sortedEntries.map((e) => {
              const isExpanded = !!expandedRowIds[e.id];
              const liveBrgProfit = e.amountCollected - (editDoc + editAudio + editClinic + editService + editStaff + editOther);
              const totalRowExpense = 
                e.expenses.doctorReferral + 
                e.expenses.audiologistCommission + 
                e.expenses.clinicShare + 
                e.expenses.anyServiceCharges + 
                e.expenses.supportStaffCommission + 
                e.expenses.otherExpenses +
                (e.expenses.brgProfit || 0);

              return (
                <div key={e.id} className="p-4 space-y-3 hover:bg-slate-50/40">
                  
                  {/* Row meta */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-800 text-[13px]">{e.patientName}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {e.patientId}
                        {e.referredDoctor && (
                          <span className="text-teal-600 font-semibold ml-1 bg-teal-50 px-1 py-0.2 rounded border border-teal-100">
                            Dr: {e.referredDoctor}
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="font-mono font-extrabold text-slate-800 text-[13px]">
                      {formatCurrency(e.amountCollected)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-semibold font-mono">
                    <span className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded border border-slate-100 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {e.clinicLocation.split(" ")[0]}
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded border border-slate-100 truncate">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {e.date}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold">
                    <span className="bg-teal-50 text-teal-800 px-2 py-0.5 rounded font-bold font-display text-[10px] border border-teal-100">
                      Bill No: {e.billNo.startsWith("BRG-BILL-") ? e.billNo.replace("BRG-BILL-", "") : e.billNo}
                    </span>
                    <button 
                      onClick={() => toggleRow(e.id)}
                      className="text-teal-600 hover:text-teal-700 flex items-center gap-0.5"
                    >
                      <span>Expenses details</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Accordion Detail Breakdown for Mobile */}
                  {isExpanded && (
                    <div className="bg-slate-50 rounded-lg p-3 space-y-2 border border-slate-200 animate-fadeIn text-[11px]">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                        <p className="font-bold text-slate-700 uppercase text-[9px] tracking-wider">Disbursement (Outflows)</p>
                        {editingExpensesId === e.id ? (
                          <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-1.5 py-0.5 rounded border border-amber-100">
                            Editing...
                          </span>
                        ) : (
                          <button
                            onClick={() => startEditExpenses(e)}
                            className="text-[10px] text-amber-700 hover:text-amber-850 font-extrabold flex items-center gap-0.5 cursor-pointer"
                          >
                            <Edit3 className="w-2.5 h-2.5" />
                            <span>Modify</span>
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 font-mono">
                        
                        <div className="flex flex-col">
                          <span className="text-slate-400 text-[10px]">1. Dr Referral:</span>
                          {editingExpensesId === e.id ? (
                            <input
                              type="number"
                              min="0"
                              value={editDoc}
                              onChange={(e) => setEditDoc(Math.max(0, parseInt(e.target.value, 10) || 0))}
                              className="w-full text-xs font-bold border rounded bg-white px-1.5 py-1 focus:border-amber-500 focus:outline-hidden"
                            />
                          ) : (
                            <strong>{formatCurrency(e.expenses.doctorReferral)}</strong>
                          )}
                        </div>

                        <div className="flex flex-col">
                          <span className="text-slate-400 text-[10px]">2. Audiologist:</span>
                          {editingExpensesId === e.id ? (
                            <input
                              type="number"
                              min="0"
                              value={editAudio}
                              onChange={(e) => setEditAudio(Math.max(0, parseInt(e.target.value, 10) || 0))}
                              className="w-full text-xs font-bold border rounded bg-white px-1.5 py-1 focus:border-amber-500 focus:outline-hidden"
                            />
                          ) : (
                            <strong>{formatCurrency(e.expenses.audiologistCommission)}</strong>
                          )}
                        </div>

                        <div className="flex flex-col">
                          <span className="text-slate-400 text-[10px]">3. Clinic Share:</span>
                          {editingExpensesId === e.id ? (
                            <input
                              type="number"
                              min="0"
                              value={editClinic}
                              onChange={(e) => setEditClinic(Math.max(0, parseInt(e.target.value, 10) || 0))}
                              className="w-full text-xs font-bold border rounded bg-white px-1.5 py-1 focus:border-amber-500 focus:outline-hidden"
                            />
                          ) : (
                            <strong>{formatCurrency(e.expenses.clinicShare)}</strong>
                          )}
                        </div>

                        <div className="flex flex-col">
                          <span className="text-slate-400 text-[10px]">4. Service Fee:</span>
                          {editingExpensesId === e.id ? (
                            <input
                              type="number"
                              min="0"
                              value={editService}
                              onChange={(e) => setEditService(Math.max(0, parseInt(e.target.value, 10) || 0))}
                              className="w-full text-xs font-bold border rounded bg-white px-1.5 py-1 focus:border-amber-500 focus:outline-hidden"
                            />
                          ) : (
                            <strong>{formatCurrency(e.expenses.anyServiceCharges)}</strong>
                          )}
                        </div>

                        <div className="flex flex-col">
                          <span className="text-slate-400 text-[10px]">5. Support Staff:</span>
                          {editingExpensesId === e.id ? (
                            <input
                              type="number"
                              min="0"
                              value={editStaff}
                              onChange={(e) => setEditStaff(Math.max(0, parseInt(e.target.value, 10) || 0))}
                              className="w-full text-xs font-bold border rounded bg-white px-1.5 py-1 focus:border-amber-500 focus:outline-hidden"
                            />
                          ) : (
                            <strong>{formatCurrency(e.expenses.supportStaffCommission)}</strong>
                          )}
                        </div>

                        <div className="flex flex-col">
                          <span className="text-slate-400 text-[10px]">6. Other Exp:</span>
                          {editingExpensesId === e.id ? (
                            <input
                              type="number"
                              min="0"
                              value={editOther}
                              onChange={(e) => setEditOther(Math.max(0, parseInt(e.target.value, 10) || 0))}
                              className="w-full text-xs font-bold border rounded bg-white px-1.5 py-1 focus:border-amber-500 focus:outline-hidden"
                            />
                          ) : (
                            <strong>{formatCurrency(e.expenses.otherExpenses)}</strong>
                          )}
                        </div>

                        <div className="flex flex-col col-span-2 bg-slate-100 p-1.5 rounded border border-slate-200 mt-1">
                          <span className="text-slate-500 text-[9px] font-bold">7. BRG Profit (Net Retention):</span>
                          <strong className={liveBrgProfit >= 0 ? "text-teal-700" : "text-rose-750"}>
                            {formatCurrency(editingExpensesId === e.id ? liveBrgProfit : (e.expenses.brgProfit || 0))}
                          </strong>
                        </div>

                      </div>

                      {editingExpensesId === e.id ? (
                        <div className="flex gap-2 pt-1 border-t border-slate-200">
                          <button
                            onClick={() => {
                              if (onUpdateExpenses) {
                                onUpdateExpenses(e.id, {
                                  doctorReferral: editDoc,
                                  audiologistCommission: editAudio,
                                  clinicShare: editClinic,
                                  anyServiceCharges: editService,
                                  supportStaffCommission: editStaff,
                                  otherExpenses: editOther,
                                  brgProfit: liveBrgProfit
                                });
                              }
                              setEditingExpensesId(null);
                            }}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-center py-1.5 rounded text-[10px] cursor-pointer"
                          >
                            Save Allocations
                          </button>
                          <button
                            onClick={() => setEditingExpensesId(null)}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-center py-1.5 px-3 rounded text-[10px] border border-slate-300 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-slate-600">
                          <span>Total Distributed:</span>
                          <span>{formatCurrency(totalRowExpense)}</span>
                        </div>
                      )}

                      {e.notes && (
                        <p className="bg-white border border-slate-200/55 p-2 rounded text-[10px] text-slate-500 italic mt-1.5">
                          " {e.notes} "
                        </p>
                      )}
                    </div>
                  )}

                  {/* Actions row */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => onOpenReceipt(e)}
                      className="px-2.5 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-100 rounded-md text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Slip</span>
                    </button>
                    <button
                      onClick={() => onEdit(e)}
                      className="px-2.5 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-100 rounded-md text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    {userRole === "admin" && (
                      <button
                        onClick={() => onDelete(e.id)}
                        className="px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-100 rounded-md text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
