/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { IncomeEntry, ExpenseDistribution } from "../types";
import { 
  User, 
  Phone, 
  Search, 
  Calendar, 
  Trash2, 
  Edit3, 
  Printer, 
  ChevronDown, 
  ChevronUp, 
  MapPin,
  FileText,
  IndianRupee,
  Users,
  BriefcaseMedical,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";

interface PatientsDatabaseProps {
  entries: IncomeEntry[];
  onEdit: (entry: IncomeEntry) => void;
  onDelete: (id: string) => void;
  onOpenReceipt: (entry: IncomeEntry) => void;
  onDeleteCompletePatientRecords?: (contact: string) => void;
  userRole?: string;
}

export default function PatientsDatabase({ 
  entries, 
  onEdit, 
  onDelete, 
  onOpenReceipt,
  onDeleteCompletePatientRecords,
  userRole = "admin"
}: PatientsDatabaseProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [expandedContact, setExpandedContact] = useState<string | null>(null);

  // 1. Group transactions into unique patient records by their Mobile Number (Contact number)
  const patientsList = useMemo(() => {
    const grouped: Record<string, {
      patientContact: string;
      patientName: string;
      patientId: string;
      latestVisitDate: string;
      latestLocation: string;
      latestDoctor: string;
      latestAslp: string;
      visitsCount: number;
      totalRevenue: number;
      visits: IncomeEntry[];
    }> = {};

    entries.forEach((entry) => {
      // If patient contact is missing or empty, use a format based on Patient ID or Name to not lose it,
      // but patient contact number is the primary target group key.
      const contactKey = entry.patientContact?.trim() || "No Mobile Info";
      
      if (!grouped[contactKey]) {
        grouped[contactKey] = {
          patientContact: contactKey,
          patientName: entry.patientName,
          patientId: entry.patientId,
          latestVisitDate: entry.date,
          latestLocation: entry.clinicLocation,
          latestDoctor: entry.referredDoctor || "Self / Direct Walk-In",
          latestAslp: entry.aslpName || "N/A",
          visitsCount: 0,
          totalRevenue: 0,
          visits: []
        };
      }

      const p = grouped[contactKey];
      p.visitsCount += 1;
      p.totalRevenue += entry.amountCollected;
      p.visits.push(entry);

      // Update latest info if this entry is newer
      if (entry.date > p.latestVisitDate) {
        p.latestVisitDate = entry.date;
        p.patientName = entry.patientName;
        p.patientId = entry.patientId;
        p.latestLocation = entry.clinicLocation;
        if (entry.referredDoctor) p.latestDoctor = entry.referredDoctor;
        if (entry.aslpName) p.latestAslp = entry.aslpName;
      }
    });

    // Sort visits under each contact descending by service date
    Object.values(grouped).forEach(p => {
      p.visits.sort((a, b) => b.date.localeCompare(a.date));
    });

    return Object.values(grouped);
  }, [entries]);

  // 2. Compute clinic locations for filter
  const locationsList = useMemo(() => {
    const locs = new Set<string>();
    entries.forEach(e => {
      if (e.clinicLocation) locs.add(e.clinicLocation);
    });
    return ["All", ...Array.from(locs)];
  }, [entries]);

  // 3. Filter patients list based on search and location
  const filteredPatients = useMemo(() => {
    return patientsList.filter(p => {
      const matchSearch = 
        p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.patientContact.includes(searchTerm) ||
        p.patientId.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchLoc = selectedLocation === "All" || p.latestLocation === selectedLocation;
      
      return matchSearch && matchLoc;
    });
  }, [patientsList, searchTerm, selectedLocation]);

  // 4. Analytics indicators
  const stats = useMemo(() => {
    const totalPatients = patientsList.length;
    const totalRevenue = entries.reduce((sum, e) => sum + e.amountCollected, 0);
    const avgRevenue = totalPatients > 0 ? Math.round(totalRevenue / totalPatients) : 0;
    const totalVisits = entries.length;

    return { totalPatients, totalRevenue, avgRevenue, totalVisits };
  }, [patientsList, entries]);

  const toggleExpand = (contact: string) => {
    if (expandedContact === contact) {
      setExpandedContact(null);
    } else {
      setExpandedContact(contact);
    }
  };

  const handleDeleteCompleteProfile = (contact: string, name: string) => {
    if (contact === "No Mobile Info") {
      alert("Cannot bulk delete entries without mobile numbers here. Please delete individual receipt logs.");
      return;
    }
    const confirmed = window.confirm(`DANGER WIPE: Are you sure you want to delete ALL clinical visit history and income logs for patient "${name}" (Mobile: ${contact})? This permanently deletes accounts recorded under this mobile key!`);
    if (confirmed && onDeleteCompletePatientRecords) {
      onDeleteCompletePatientRecords(contact);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* 1. Header Metrics Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="patient-db-stats">
        
        {/* Total Patients */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="bg-indigo-50 p-2.5 rounded-lg text-indigo-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Unique Patient Index</p>
            <p className="text-lg font-black text-slate-800">{stats.totalPatients} Individuals</p>
          </div>
        </div>

        {/* Total Visits logs */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="bg-emerald-50 p-2.5 rounded-lg text-emerald-600">
            <BriefcaseMedical className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Recorded Visits</p>
            <p className="text-lg font-black text-slate-800">{stats.totalVisits} Consultations</p>
          </div>
        </div>

        {/* Total Inflow billing */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="bg-teal-50 p-2.5 rounded-lg text-teal-600">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Gross Patient Revenue</p>
            <p className="text-lg font-black text-teal-700">₹{stats.totalRevenue.toLocaleString("en-IN")}</p>
          </div>
        </div>

        {/* Avg per patient */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="bg-amber-50 p-2.5 rounded-lg text-amber-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-display">Average Patient Value</p>
            <p className="text-lg font-black text-slate-800">₹{stats.avgRevenue.toLocaleString("en-IN")}</p>
          </div>
        </div>

      </div>

      {/* 2. Control search bar toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-4 justify-between" id="patient-db-toolbar">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by Patient Name, Phone Number, or Patient ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs font-semibold border border-slate-300 rounded-lg pl-9 pr-4 py-2.5 focus:border-emerald-550 focus:outline-hidden transition-colors"
          />
        </div>

        {/* Filter Center Dropdown */}
        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Filter Location:</span>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="text-xs font-bold border border-slate-300 rounded-lg py-2 px-3 bg-white focus:outline-hidden focus:border-emerald-500 cursor-pointer"
          >
            {locationsList.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

      </div>

      {/* 3. Patients Records Listing Drawer/Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        
        <div className="bg-slate-50 border-b border-slate-200 py-3 px-5 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-display">
            Unique Patients Directory ({filteredPatients.length} shown)
          </h3>
          <span className="text-[10px] bg-indigo-50 text-indigo-700 font-extrabold px-2 py-0.5 rounded-full uppercase">
            Primary Key: Contact No
          </span>
        </div>

        {filteredPatients.length === 0 ? (
          <div className="p-12 text-center text-slate-400 italic font-semibold text-xs">
            No matching patient profiles found in the Rehabilitation Database. Adjust your query or register a new patient slip!
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredPatients.map((patient) => {
              const isExpanded = expandedContact === patient.patientContact;
              const hasContact = patient.patientContact !== "No Mobile Info";

              return (
                <div key={patient.patientContact} className={`transition-all duration-150 ${isExpanded ? "bg-slate-50/50" : "hover:bg-slate-50/20"}`}>
                  
                  {/* Row Trigger */}
                  <div 
                    onClick={() => toggleExpand(patient.patientContact)}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                  >
                    
                    {/* Patient core info */}
                    <div className="flex items-start gap-3.5">
                      <div className="bg-slate-100 p-2.5 rounded-full text-slate-500 font-bold max-h-max shrink-0">
                        <User className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-black text-slate-800">{patient.patientName}</h4>
                          <span className="text-[10px] font-bold bg-slate-100 border text-slate-600 px-2 py-0.2 rounded-sm font-mono">
                            {patient.patientId}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-slate-505">
                          <span className="flex items-center gap-1">
                            <span className="text-slate-400">📞</span>
                            <span className="font-mono text-slate-800 font-bold">{patient.patientContact}</span>
                          </span>
                          <span className="flex items-center gap-1 text-[11px]">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>Clinic: <strong className="text-slate-700">{patient.latestLocation}</strong></span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Patient visit metrics and expands indicator */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                      
                      <div className="text-left sm:text-right space-y-0.5">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none">Consultations</p>
                        <p className="text-xs font-extrabold text-slate-700">
                          {patient.visitsCount} {patient.visitsCount === 1 ? "visit" : "visits"}
                        </p>
                      </div>

                      <div className="text-left sm:text-right space-y-0.5">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none">Total Invested</p>
                        <p className="text-xs font-bold text-emerald-600 font-mono">
                          ₹{patient.totalRevenue.toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {userRole === "admin" && onDeleteCompletePatientRecords && hasContact && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCompleteProfile(patient.patientContact, patient.patientName);
                            }}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded bg-white border border-slate-205 transition-colors cursor-pointer"
                            title="Delete patient and clinical billing records under this contact"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <div className="text-slate-400 p-1 bg-slate-100 rounded-sm">
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-indigo-655" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* Expanded visit logs tables */}
                  {isExpanded && (
                    <div className="px-4 pb-5 sm:px-6 animate-fadeIn">
                      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                        
                        <div className="bg-indigo-50/40 px-4 py-2.5 border-b border-slate-200/80 flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-950 flex items-center gap-1.5 font-display">
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                            Clinical Visit & Billing History Logs
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold font-mono">
                            Latest Consultation: {patient.latestVisitDate}
                          </span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                                <th className="p-3">Visit Date</th>
                                <th className="p-3">Bill Number</th>
                                <th className="p-3">Therapeutic/Medical Service</th>
                                <th className="p-3">Mode</th>
                                <th className="p-3 text-right">Collected (INR)</th>
                                <th className="p-3 text-center">Receipt Operations</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-150">
                              {patient.visits.map((visit) => (
                                <tr key={visit.id} className="hover:bg-slate-50/50">
                                  <td className="p-2 px-3 whitespace-nowrap">
                                    <div className="font-bold text-slate-800 flex items-center gap-1 font-mono text-[11px]">
                                      <Calendar className="w-3 h-3 text-slate-400" />
                                      {visit.date}
                                    </div>
                                    {visit.paymentDate && (
                                      visit.paymentDate === "Pending" ? (
                                        <div className="text-[9px] text-amber-600 font-extrabold flex items-center gap-1 mt-0.5 animate-pulse bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 w-max">
                                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping"></span>
                                          <span>Unpaid / Pending</span>
                                        </div>
                                      ) : visit.paymentDate !== visit.date ? (
                                        <div className="text-[9px] text-indigo-600 font-semibold flex items-center gap-0.5 mt-0.5">
                                          <span>Paid on:</span>
                                          <span className="font-mono">{visit.paymentDate}</span>
                                        </div>
                                      ) : null
                                    )}
                                  </td>
                                  <td className="p-3 font-mono font-bold text-slate-500 text-[10.5px]">
                                    {visit.billNo}
                                  </td>
                                  <td className="p-3 max-w-xs truncate font-bold text-slate-800">
                                    {visit.serviceType}
                                    {visit.notes && (
                                      <p className="text-[10px] text-slate-400 font-medium italic mt-0.5 truncate max-w-xs">
                                        "{visit.notes}"
                                      </p>
                                    )}
                                  </td>
                                  <td className="p-3 font-semibold text-slate-600">
                                    {visit.paymentMode}
                                  </td>
                                  <td className="p-3 text-right font-black font-mono text-slate-700 text-[12.5px]">
                                    ₹{visit.amountCollected.toLocaleString("en-IN")}
                                  </td>
                                  <td className="p-3">
                                    <div className="flex items-center justify-center gap-1.5">
                                      <button
                                        onClick={() => onOpenReceipt(visit)}
                                        className="px-2 py-1 text-[10.5px] font-extrabold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded flex items-center gap-1 cursor-pointer transition-colors"
                                        title="Print formal invoice receipt"
                                      >
                                        <Printer className="w-3 h-3" />
                                        <span>Invoice</span>
                                      </button>
                                      
                                      <button
                                        onClick={() => onEdit(visit)}
                                        className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border rounded transition-colors bg-white cursor-pointer"
                                        title="Edit this invoice/payment particulars"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      
                                      {userRole === "admin" && (
                                        <button
                                          onClick={() => onDelete(visit.id)}
                                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 border rounded transition-colors bg-white cursor-pointer"
                                          title="Delete this visit collection"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
