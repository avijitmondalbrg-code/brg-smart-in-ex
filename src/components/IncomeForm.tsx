/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { 
  IncomeEntry, 
  ExpenseDistribution, 
  CLINIC_LOCATIONS, 
  SERVICE_TYPES, 
  PAYMENT_MODES, 
  DEFAULT_DISTRIBUTION_PRESETS,
  DistributionPreset,
  SelectedServiceItem
} from "../types";
import { 
  User, 
  Hash, 
  Calendar, 
  BriefcaseMedical, 
  IndianRupee, 
  CreditCard, 
  FileText, 
  MapPin, 
  Percent, 
  Sparkles, 
  Calculator, 
  Save, 
  X,
  RefreshCw,
  AlertTriangle,
  Phone,
  Check
} from "lucide-react";

interface IncomeFormProps {
  onSubmit: (entry: Omit<IncomeEntry, "id" | "createdTime"> & { id?: string }) => void;
  editingEntry?: IncomeEntry | null;
  onCancelEdit?: () => void;
  entries: IncomeEntry[];
}

export default function IncomeForm({ onSubmit, editingEntry, onCancelEdit, entries }: IncomeFormProps) {
  // Form core states
  const [patientName, setPatientName] = useState("");
  const [patientContact, setPatientContact] = useState("");
  const [patientId, setPatientId] = useState("");
  const [referredDoctor, setReferredDoctor] = useState("");
  const [aslpName, setAslpName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().substring(0, 10));
  const [serviceType, setServiceType] = useState(SERVICE_TYPES[0]);
  const [customServiceType, setCustomServiceType] = useState("");
  const [amountCollected, setAmountCollected] = useState<number>(0);
  const [grossAmount, setGrossAmount] = useState<number>(1500);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState(PAYMENT_MODES[0]);
  const [notes, setNotes] = useState("");
  const [clinicLocation, setClinicLocation] = useState(CLINIC_LOCATIONS[0]);
  const [billNo, setBillNo] = useState("");
  const [isPaymentPending, setIsPaymentPending] = useState(false);

  // GST State Parameters
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstRate, setGstRate] = useState<number>(18);
  const [gstType, setGstType] = useState<"inclusive" | "exclusive">("inclusive");

  // States for multiple services/procedures under one invoice
  const [isMultipleServices, setIsMultipleServices] = useState<boolean>(false);
  const [selectedServicesList, setSelectedServicesList] = useState<SelectedServiceItem[]>([]);
  
  // Builder state for adding a service item
  const [itemServiceType, setItemServiceType] = useState<string>(SERVICE_TYPES[0]);
  const [itemCustomServiceType, setItemCustomServiceType] = useState<string>("");
  const [itemAmount, setItemAmount] = useState<number>(0);

  // Distribution core states
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [doctorReferral, setDoctorReferral] = useState<number>(0);
  const [audiologistCommission, setAudiologistCommission] = useState<number>(0);
  const [clinicShare, setClinicShare] = useState<number>(0);
  const [anyServiceCharges, setAnyServiceCharges] = useState<number>(0);
  const [supportStaffCommission, setSupportStaffCommission] = useState<number>(0);
  const [otherExpenses, setOtherExpenses] = useState<number>(0);

  // Derived state: BRG Profit is the remaining surplus / net retention
  const brgProfit = amountCollected - (
    doctorReferral +
    audiologistCommission +
    clinicShare +
    anyServiceCharges +
    supportStaffCommission +
    otherExpenses
  );

  // Get financial year segment in YY-YY format based on Indian Fiscal Year (April 1st to March 31st)
  const getFinancialYearSegment = (chosenDate: string): string => {
    const dateObj = new Date(chosenDate);
    if (isNaN(dateObj.getTime())) return "26-27";
    
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1; // getMonth() is 0-11
    
    let startYear = year;
    if (month < 4) {
      startYear = year - 1;
    }
    const endYear = startYear + 1;
    
    const startYrStr = String(startYear).slice(-2);
    const endYrStr = String(endYear).slice(-2);
    
    return `${startYrStr}-${endYrStr}`;
  };

  // Trigger id generation based on date and dynamic entries sequences
  const regenerateIds = (chosenDate: string) => {
    const fyStr = getFinancialYearSegment(chosenDate);
    
    const ptPrefix = `BR-PT-${fyStr}-`;
    const blPrefix = `BR-BL-${fyStr}-`;

    let maxPtSeq = 0;
    let maxBlSeq = 0;

    // Search existing entries to find the maximum serial sequence number
    if (entries && Array.isArray(entries)) {
      entries.forEach(entry => {
        if (entry.patientId && entry.patientId.startsWith(ptPrefix)) {
          const suffix = entry.patientId.substring(ptPrefix.length);
          const seqVal = parseInt(suffix, 10);
          if (!isNaN(seqVal) && seqVal > maxPtSeq) {
            maxPtSeq = seqVal;
          }
        }
        
        if (entry.billNo && entry.billNo.startsWith(blPrefix)) {
          const suffix = entry.billNo.substring(blPrefix.length);
          const seqVal = parseInt(suffix, 10);
          if (!isNaN(seqVal) && seqVal > maxBlSeq) {
            maxBlSeq = seqVal;
          }
        }
      });
    }

    const nextPtSeq = maxPtSeq + 1;
    const nextBlSeq = maxBlSeq + 1;

    const nextPtId = `${ptPrefix}${String(nextPtSeq).padStart(4, "0")}`;
    const nextBlNo = `${blPrefix}${String(nextBlSeq).padStart(4, "0")}`;

    setPatientId(nextPtId);
    setBillNo(nextBlNo);
  };

  const [isMatchedPatient, setIsMatchedPatient] = useState(false);

  // Setup form values for new or edited items
  useEffect(() => {
    if (editingEntry) {
      setPatientName(editingEntry.patientName);
      setPatientContact(editingEntry.patientContact || "");
      setPatientId(editingEntry.patientId);
      setDate(editingEntry.date);
      if (editingEntry.paymentDate === "Pending" || !editingEntry.paymentDate) {
        setIsPaymentPending(true);
        setPaymentDate("");
      } else {
        setIsPaymentPending(false);
        setPaymentDate(editingEntry.paymentDate);
      }
      setReferredDoctor(editingEntry.referredDoctor || "");
      setAslpName(editingEntry.aslpName || "");
      setIsMatchedPatient(false);
      
      const isCustomService = !SERVICE_TYPES.includes(editingEntry.serviceType);
      if (isCustomService) {
        setServiceType("Other");
        setCustomServiceType(editingEntry.serviceType);
      } else {
        setServiceType(editingEntry.serviceType);
        setCustomServiceType("");
      }
      
      const disc = editingEntry.discount || 0;
      setDiscount(disc);
      setGrossAmount(editingEntry.amountCollected + disc);
      setAmountCollected(editingEntry.amountCollected);
      setPaymentMode(editingEntry.paymentMode);
      setNotes(editingEntry.notes);
      setClinicLocation(editingEntry.clinicLocation);
      setBillNo(editingEntry.billNo);

      if (editingEntry.selectedServices && editingEntry.selectedServices.length > 0) {
        setIsMultipleServices(true);
        setSelectedServicesList(editingEntry.selectedServices);
      } else {
        setIsMultipleServices(false);
        setSelectedServicesList([]);
      }

      // Load expenses
      setDoctorReferral(editingEntry.expenses.doctorReferral);
      setAudiologistCommission(editingEntry.expenses.audiologistCommission);
      setClinicShare(editingEntry.expenses.clinicShare);
      setAnyServiceCharges(editingEntry.expenses.anyServiceCharges);
      setSupportStaffCommission(editingEntry.expenses.supportStaffCommission);
      setOtherExpenses(editingEntry.expenses.otherExpenses);
      
      // Load GST parameters if present
      setGstEnabled(!!editingEntry.gstEnabled);
      setGstRate(editingEntry.gstRate || 18);
      setGstType(editingEntry.gstType || "inclusive");

      // Set preset to Custom since we are editing custom values
      setSelectedPresetIndex(-1);
    } else {
      // Clear forms
      setPatientName("");
      setPatientContact("");
      setReferredDoctor("");
      setAslpName("");
      setIsMatchedPatient(false);
      setIsPaymentPending(false);
      const today = new Date().toISOString().substring(0, 10);
      setDate(today);
      setPaymentDate(today);
      setServiceType(SERVICE_TYPES[0]);
      setCustomServiceType("");
      setDiscount(0);
      setGrossAmount(1500);
      setAmountCollected(1500); // realistic default treatment charge
      setPaymentMode(PAYMENT_MODES[0]);
      setNotes("");
      setClinicLocation(CLINIC_LOCATIONS[0]);
      setIsMultipleServices(false);
      setSelectedServicesList([]);
      setItemCustomServiceType("");
      setItemAmount(0);
      
      // Reset GST parameters
      setGstEnabled(false);
      setGstRate(18);
      setGstType("inclusive");
      
      regenerateIds(today);
      setSelectedPresetIndex(0); // standard referral
    }
  }, [editingEntry]);

  // Auto-fill patient details backend matching
  useEffect(() => {
    if (editingEntry) return; // Prevent during editing
    const cleanNum = patientContact.trim().replace(/\D/g, "");
    if (cleanNum.length >= 10) {
      const match = entries.find(e => {
        const entContact = e.patientContact?.trim().replace(/\D/g, "") || "";
        return entContact === cleanNum;
      });
      if (match) {
        setPatientName(match.patientName);
        setPatientId(match.patientId);
        if (match.referredDoctor) setReferredDoctor(match.referredDoctor);
        if (match.aslpName) setAslpName(match.aslpName);
        if (match.clinicLocation) setClinicLocation(match.clinicLocation);
        setIsMatchedPatient(true);
      } else {
        setIsMatchedPatient(false);
        const currentFy = getFinancialYearSegment(date);
        if (!patientId.startsWith(`BR-PT-${currentFy}-`)) {
          regenerateIds(date);
        }
      }
    } else {
      setIsMatchedPatient(false);
      const currentFy = getFinancialYearSegment(date);
      if (!patientId.startsWith(`BR-PT-${currentFy}-`)) {
        regenerateIds(date);
      }
    }
  }, [patientContact, entries, editingEntry, date, patientId]);

  // Automatically select standard referral (preset 0) or direct walk-in (preset 1)
  useEffect(() => {
    if (!editingEntry) {
      const trimmedDoc = referredDoctor.trim().toLowerCase();
      if (!trimmedDoc || trimmedDoc === "self" || trimmedDoc === "direct" || trimmedDoc.includes("walk-in") || trimmedDoc === "self / direct walk-in") {
        setSelectedPresetIndex(1); // Direct Walk-in (0% Doctor Referral)
      } else {
        setSelectedPresetIndex(0); // Standard Referral (15% Doctor Referral)
      }
    }
  }, [referredDoctor, editingEntry]);

  // Recalculate net amount collected when services list, gross amount, discount, GST parameters or mode changes
  useEffect(() => {
    const subtotal = isMultipleServices
      ? selectedServicesList.reduce((sum, item) => sum + item.amount, 0)
      : grossAmount;
    const afterDiscount = Math.max(0, subtotal - discount);

    if (gstEnabled && gstType === "exclusive") {
      setAmountCollected(Math.round(afterDiscount * (1 + gstRate / 100)));
    } else {
      setAmountCollected(afterDiscount);
    }
  }, [selectedServicesList, isMultipleServices, grossAmount, discount, gstEnabled, gstRate, gstType]);

  // Recalculate expense distributions based on active preset and raw collected amount
  useEffect(() => {
    if (selectedPresetIndex !== -1 && !editingEntry) {
      const preset = DEFAULT_DISTRIBUTION_PRESETS[selectedPresetIndex];
      if (preset) {
        setDoctorReferral(Math.round((amountCollected * preset.doctorReferralPct) / 100));
        setAudiologistCommission(Math.round((amountCollected * preset.audiologistCommissionPct) / 100));
        setClinicShare(Math.round((amountCollected * preset.clinicSharePct) / 100));
        setAnyServiceCharges(Math.round((amountCollected * preset.anyServiceChargesPct) / 100));
        setSupportStaffCommission(Math.round((amountCollected * preset.supportStaffCommissionPct) / 100));
        setOtherExpenses(Math.round((amountCollected * preset.otherExpensesPct) / 100));
      }
    }
  }, [amountCollected, selectedPresetIndex, editingEntry]);

  // Handle manual date change
  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    if (!editingEntry) {
      regenerateIds(newDate);
    }
  };

  // Quick preset trigger helper
  const handlePresetSelect = (presetIdx: number) => {
    setSelectedPresetIndex(presetIdx);
    if (presetIdx !== -1) {
      const preset = DEFAULT_DISTRIBUTION_PRESETS[presetIdx];
      setDoctorReferral(Math.round((amountCollected * preset.doctorReferralPct) / 100));
      setAudiologistCommission(Math.round((amountCollected * preset.audiologistCommissionPct) / 100));
      setClinicShare(Math.round((amountCollected * preset.clinicSharePct) / 100));
      setAnyServiceCharges(Math.round((amountCollected * preset.anyServiceChargesPct) / 100));
      setSupportStaffCommission(Math.round((amountCollected * preset.supportStaffCommissionPct) / 100));
      setOtherExpenses(Math.round((amountCollected * preset.otherExpensesPct) / 100));
    }
  };

  // Helper calculation of standard operational expenses sum (without net retention)
  const sumOperationalExpenses = 
    doctorReferral + 
    audiologistCommission + 
    clinicShare + 
    anyServiceCharges + 
    supportStaffCommission + 
    otherExpenses;

  // Total allocated including BRG Profit (which is mathematically identical to amountCollected)
  const sumAllocatedExpenses = sumOperationalExpenses + brgProfit;

  const excessAmount = sumOperationalExpenses - amountCollected;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      alert("Please enter a valid Patient Name.");
      return;
    }
    if (amountCollected <= 0) {
      alert("Please enter a valid Collected Amount.");
      return;
    }

    if (isMultipleServices && selectedServicesList.length === 0) {
      alert("Please add at least one medical service to compute your combined invoice.");
      return;
    }

    const finalServiceType = isMultipleServices
      ? selectedServicesList.map(s => s.serviceType).join(" + ")
      : (serviceType === "Other" ? (customServiceType || "Other Service") : serviceType);

    let calculatedGstAmount = 0;
    if (gstEnabled) {
      const subtotal = isMultipleServices
        ? selectedServicesList.reduce((sum, item) => sum + item.amount, 0)
        : grossAmount;
      const afterDiscount = Math.max(0, subtotal - discount);

      if (gstType === "inclusive") {
        calculatedGstAmount = Math.round(afterDiscount - (afterDiscount / (1 + gstRate / 100)));
      } else {
        calculatedGstAmount = Math.round((afterDiscount * gstRate) / 100);
      }
    }
    const cgst = Math.round((calculatedGstAmount / 2) * 100) / 100;
    const sgst = Math.round((calculatedGstAmount / 2) * 100) / 100;

    const entryPayload = {
      patientName: patientName.trim(),
      patientContact: patientContact.trim(),
      patientId,
      date,
      paymentDate: isPaymentPending ? "Pending" : paymentDate,
      serviceType: finalServiceType,
      amountCollected,
      paymentMode,
      notes: notes.trim(),
      clinicLocation,
      billNo,
      referredDoctor: referredDoctor.trim(),
      aslpName: aslpName.trim(),
      discount,
      gstEnabled,
      gstRate: gstEnabled ? gstRate : undefined,
      gstType: gstEnabled ? gstType : undefined,
      gstAmount: gstEnabled ? calculatedGstAmount : undefined,
      cgstAmount: gstEnabled ? cgst : undefined,
      sgstAmount: gstEnabled ? sgst : undefined,
      expenses: {
        doctorReferral,
        audiologistCommission,
        clinicShare,
        anyServiceCharges,
        supportStaffCommission,
        otherExpenses,
        brgProfit
      },
      // Save itemized billing table if multi-service mode is selected
      ...(isMultipleServices ? { selectedServices: selectedServicesList } : {}),
      // Pass original ID if editing to overwrite correctly
      ...(editingEntry ? { id: editingEntry.id } : {})
    };

    onSubmit(entryPayload);

    // Reset if it was a custom edit
    if (editingEntry && onCancelEdit) {
      onCancelEdit();
    } else {
      // Clear patient specifics for swift next entries
      setPatientName("");
      setPatientContact("");
      setReferredDoctor("");
      setAslpName("");
      setIsMatchedPatient(false);
      regenerateIds(date);
      setNotes("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6 animate-fadeIn" id="finance-entry-form">
      
      {/* FULL WIDTH CARD FORM */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Banner Indicator/Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${editingEntry ? "bg-amber-500 animate-pulse" : "bg-teal-500"}`} />
            <h3 className="text-xs font-bold text-slate-800 font-display uppercase tracking-wider">
              {editingEntry ? "Edit Transaction Slip" : "Register Patient Collection (Inflow)"}
            </h3>
          </div>
          {editingEntry && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-2 py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Cancel Edit</span>
            </button>
          )}
        </div>

        {/* Inputs */}
        <div className="p-5 space-y-4">
          
          {/* Patient Details Row (Symmetrical 5 columns on desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            
            {/* Patient Mobile No. */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                  Mobile Number <span className="text-rose-500">*</span>
                </span>
                {isMatchedPatient && (
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 animate-bounce">
                    <Check className="w-2.5 h-2.5" /> Found
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g., 9876543210"
                  value={patientContact}
                  onChange={(e) => setPatientContact(e.target.value)}
                  className="w-full text-xs font-bold font-mono border border-slate-300 rounded-lg py-2.5 px-3 focus:border-emerald-500 focus:outline-hidden transition-colors"
                  id="inp-patient-contact"
                />
              </div>
            </div>

            {/* Patient Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Patient Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g., Ananya Sengupta"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-300 rounded-lg py-2.5 px-3 focus:border-emerald-500 focus:outline-hidden transition-colors"
                  id="inp-patient-name"
                />
              </div>
            </div>

            {/* Custom Location Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Clinic Center / Location <span className="text-rose-500">*</span>
              </label>
              <select
                value={clinicLocation}
                onChange={(e) => setClinicLocation(e.target.value)}
                className="w-full text-xs font-semibold border border-slate-300 rounded-lg py-2.5 px-3 bg-white focus:border-emerald-500 focus:outline-hidden transition-colors cursor-pointer"
                id="sel-clinic-location"
              >
                {CLINIC_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Referral Doctor */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-teal-600" />
                Refer Dr. / Clinician
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g., Dr. S. K. Roy (or Self)"
                  value={referredDoctor}
                  onChange={(e) => setReferredDoctor(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-300 rounded-lg py-2.5 px-3 focus:border-emerald-500 focus:outline-hidden transition-colors"
                  id="inp-referred-doctor"
                />
              </div>
            </div>

            {/* ASLP Name (Audiologist) */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                ASLP (Audiologist Name)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g., Atanu Saha"
                  value={aslpName}
                  onChange={(e) => setAslpName(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-300 rounded-lg py-2.5 px-3 focus:border-emerald-500 focus:outline-hidden transition-colors"
                  id="inp-aslp-name"
                />
              </div>
            </div>

          </div>

          {/* Invoice Mode Toggle */}
          <div className="bg-slate-50/70 rounded-xl border border-slate-200 p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3" id="invoice-mode-toggle-panel">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 font-display uppercase tracking-wide">
                <BriefcaseMedical className="w-4 h-4 text-emerald-600 animate-pulse" />
                Invoice Billing Mode
              </span>
              <p className="text-[10px] text-slate-500 font-semibold mb-0">Select whether this bill logs a single treatment/test or aggregates multiple medical procedures.</p>
            </div>
            <div className="flex bg-slate-200/80 p-1 rounded-lg gap-1 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setIsMultipleServices(false);
                  if (selectedServicesList.length > 0) {
                    setAmountCollected(selectedServicesList[0].amount);
                  }
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${!isMultipleServices ? "bg-white text-emerald-800 shadow-xs" : "text-slate-600 hover:text-slate-800"}`}
                id="btn-single-service-mode"
              >
                <span>Single Service</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMultipleServices(true);
                  if (selectedServicesList.length === 0) {
                    const currentService = serviceType === "Other" ? (customServiceType || "Other Service") : serviceType;
                    const val = amountCollected || 1500;
                    setSelectedServicesList([{ serviceType: currentService, amount: val }]);
                  }
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${isMultipleServices ? "bg-white text-emerald-800 shadow-xs" : "text-slate-600 hover:text-slate-800"}`}
                id="btn-multiple-services-mode"
              >
                <span>Multiple Services</span>
                <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[9px] px-1.5 py-0.5 rounded-full uppercase">NEW</span>
              </button>
            </div>
          </div>

          {/* Billing and Transaction details Row */}
          {!isMultipleServices ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3" id="row-single-service-billing">
                
                {/* Appointment Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Date Of Service <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full text-xs font-medium border border-slate-300 rounded-lg py-2.5 px-3 focus:border-emerald-500 focus:outline-hidden transition-colors cursor-pointer"
                    id="inp-service-date"
                  />
                </div>

                {/* Date of Payment */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center justify-between gap-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      Date Of Payment {!isPaymentPending && <span className="text-rose-500">*</span>}
                    </span>
                    <label className="inline-flex items-center gap-1 text-[10px] text-indigo-600 cursor-pointer font-bold select-none">
                      <input
                        type="checkbox"
                        checked={isPaymentPending}
                        onChange={(e) => setIsPaymentPending(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 cursor-pointer accent-indigo-600"
                      />
                      <span>Pending / NA</span>
                    </label>
                  </label>
                  {isPaymentPending ? (
                    <div className="w-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-lg py-2.5 px-3 flex items-center gap-1.5 animate-pulse">
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
                      <span>Payment Pending / NA</span>
                    </div>
                  ) : (
                    <input
                      type="date"
                      required
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full text-xs font-medium border border-slate-300 rounded-lg py-2.5 px-3 focus:border-indigo-500 focus:outline-hidden transition-colors cursor-pointer"
                      id="inp-payment-date"
                    />
                  )}
                </div>

                {/* Service Type Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                    <BriefcaseMedical className="w-3.5 h-3.5 text-slate-400" />
                    Medical Service Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full text-xs font-semibold border border-slate-300 rounded-lg py-2.5 px-3 bg-white focus:border-emerald-500 focus:outline-hidden transition-colors cursor-pointer"
                    id="sel-service-type"
                  >
                    {SERVICE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                    <option value="Other">Other (Write Custom Service)</option>
                  </select>
                </div>

                {/* Gross Amount Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                    <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                    Gross Fee (INR) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">₹</span>
                    <input
                      type="number"
                      required
                      min="1"
                      max="1000000"
                      placeholder="0.00"
                      value={grossAmount || ""}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setGrossAmount(isNaN(val) ? 0 : val);
                      }}
                      className="w-full text-xs font-bold font-mono border border-slate-300 rounded-lg py-2.5 pl-7 pr-3 focus:border-emerald-500 focus:outline-hidden transition-colors"
                      id="inp-gross-amount"
                    />
                  </div>
                </div>

                {/* Discount Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                    Discount (INR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">₹</span>
                    <input
                      type="number"
                      min="0"
                      max="100000"
                      placeholder="0.00"
                      value={discount || ""}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setDiscount(isNaN(val) ? 0 : val);
                      }}
                      className="w-full text-xs font-bold font-mono border border-slate-300 rounded-lg py-2.5 pl-7 pr-3 focus:border-emerald-500 focus:outline-hidden transition-colors"
                      id="inp-discount"
                    />
                  </div>
                </div>

                {/* Payment Mode */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    Payment Mode <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full text-xs font-semibold border border-slate-300 rounded-lg py-2.5 px-3 bg-white focus:border-emerald-500 focus:outline-hidden transition-colors cursor-pointer"
                    id="sel-payment-mode"
                  >
                    {PAYMENT_MODES.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {discount > 0 && (
                <div className="text-right text-xs font-bold text-emerald-600 bg-emerald-50/50 max-w-max ml-auto px-4 py-2 rounded-xl border border-emerald-100 mt-1 flex items-center gap-2 animate-fadeIn">
                  <span>Net Received Collection:</span>
                  <span className="font-mono bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded text-[13px]">₹{amountCollected}</span>
                  <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-black">
                    -{Math.round((discount / (grossAmount || 1)) * 100)}% Off
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4" id="row-multiple-services-meta">
              
              {/* Appointment Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Date Of Service <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-300 rounded-lg py-2.5 px-3 focus:border-emerald-500 focus:outline-hidden transition-colors cursor-pointer"
                  id="inp-service-date-multi"
                />
              </div>

              {/* Date of Payment */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center justify-between gap-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    Date Of Payment {!isPaymentPending && <span className="text-rose-500">*</span>}
                  </span>
                  <label className="inline-flex items-center gap-1 text-[10px] text-indigo-600 cursor-pointer font-bold select-none">
                    <input
                      type="checkbox"
                      checked={isPaymentPending}
                      onChange={(e) => setIsPaymentPending(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 cursor-pointer accent-indigo-600"
                    />
                    <span>Pending / NA</span>
                  </label>
                </label>
                {isPaymentPending ? (
                  <div className="w-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-lg py-2.5 px-3 flex items-center gap-1.5 animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
                    <span>Payment Pending / NA</span>
                  </div>
                ) : (
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full text-xs font-medium border border-slate-300 rounded-lg py-2.5 px-3 focus:border-indigo-500 focus:outline-hidden transition-colors cursor-pointer"
                    id="inp-payment-date-multi"
                  />
                )}
              </div>

              {/* Discount Input for multi service */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Discount (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">₹</span>
                  <input
                    type="number"
                    min="0"
                    max="100000"
                    placeholder="0.00"
                    value={discount || ""}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setDiscount(isNaN(val) ? 0 : val);
                    }}
                    className="w-full text-xs font-bold font-mono border border-slate-300 rounded-lg py-2.5 pl-7 pr-3 focus:border-emerald-500 focus:outline-hidden transition-colors"
                    id="inp-discount-multi"
                  />
                </div>
              </div>

              {/* Payment Mode */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  Payment Instrument/Mode <span className="text-rose-500">*</span>
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full text-xs font-semibold border border-slate-300 rounded-lg py-2.5 px-3 bg-white focus:border-emerald-500 focus:outline-hidden transition-colors cursor-pointer"
                  id="sel-payment-mode-multi"
                >
                  {PAYMENT_MODES.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
              </div>

              {/* Aggregated Total Amount (Read-only) */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Net Collection (INR) <span className="text-emerald-600">(Calculated)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-700">₹</span>
                  <input
                    type="text"
                    disabled
                    value={`${amountCollected} (Minus Discount)`}
                    className="w-full text-xs font-bold font-mono border border-slate-200 rounded-lg py-2.5 pl-7 pr-3 bg-emerald-50/50 text-emerald-800 focus:outline-hidden cursor-not-allowed"
                    id="inp-amount-collected-multi"
                  />
                </div>
              </div>

            </div>
          )}

          {/* Builder section for multiple services */}
          {isMultipleServices && (
            <div className="bg-emerald-50/20 border border-emerald-100 rounded-xl p-4.5 space-y-4 animate-fadeIn" id="multi-services-builder">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-950 font-display flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                Itemized Medical Services List
              </h4>

              {/* Dynamic list rendering */}
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white text-xs">
                {selectedServicesList.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 font-semibold italic">
                    No medical services added to this receipt yet. Please add at least one service below to build your invoice.
                  </div>
                ) : (
                  <div>
                    {/* Header */}
                    <div className="grid grid-cols-12 bg-slate-50 py-2.5 px-3 font-bold text-slate-600 border-b border-slate-200">
                      <div className="col-span-1">#</div>
                      <div className="col-span-7">Service Name & Test Procedure</div>
                      <div className="col-span-3 text-right">Amount (INR)</div>
                      <div className="col-span-1 text-center font-bold">Action</div>
                    </div>
                    {/* Items */}
                    <div className="divide-y divide-slate-150">
                      {selectedServicesList.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-12 py-2.5 px-3 items-center hover:bg-slate-50/50">
                          <div className="col-span-1 font-mono font-bold text-slate-400">{idx + 1}</div>
                          <div className="col-span-7 font-bold text-slate-800">{item.serviceType}</div>
                          <div className="col-span-3 text-right font-mono font-black text-slate-700">₹{item.amount}</div>
                          <div className="col-span-1 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = selectedServicesList.filter((_, i) => i !== idx);
                                setSelectedServicesList(updated);
                              }}
                              className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1 rounded-md transition-colors inline-flex justify-center items-center cursor-pointer"
                              title="Delete service item"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Footer - Total Sum */}
                    <div className="grid grid-cols-12 bg-slate-50/70 py-2.5 px-3 font-bold text-slate-800 border-t border-slate-200 items-center">
                      <div className="col-span-8 text-right text-slate-500 uppercase tracking-widest text-[10px] font-bold">Combined Bill Inflow total:</div>
                      <div className="col-span-3 text-right font-mono font-extrabold text-emerald-705 text-[15px]">₹{amountCollected}</div>
                      <div className="col-span-1"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Service item builder controls */}
              <div className="p-3.5 bg-white rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Select Medical Service/Test
                  </label>
                  <select
                    value={itemServiceType}
                    onChange={(e) => setItemServiceType(e.target.value)}
                    className="w-full text-xs font-semibold border border-slate-300 rounded-lg py-2 px-2.5 bg-white focus:border-emerald-500 focus:outline-hidden transition-colors cursor-pointer"
                    id="sel-builder-service-type"
                  >
                    {SERVICE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                    <option value="Other">Other Custom Service</option>
                  </select>
                </div>

                {itemServiceType === "Other" && (
                  <div className="md:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Enter Custom Service Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Free-field Audiometry"
                      value={itemCustomServiceType}
                      onChange={(e) => setItemCustomServiceType(e.target.value)}
                      className="w-full text-xs font-medium border border-slate-300 rounded-lg py-2 px-3 bg-white focus:border-emerald-500 focus:outline-hidden transition-colors"
                      id="inp-builder-custom-service"
                    />
                  </div>
                )}

                <div className={`${itemServiceType === "Other" ? "md:col-span-2" : "md:col-span-5"}`}>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Amount (INR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 800"
                      value={itemAmount || ""}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setItemAmount(isNaN(val) ? 0 : val);
                      }}
                      className="w-full text-xs font-bold font-mono border border-slate-300 rounded-lg py-2 pl-6 pr-2.5 focus:border-emerald-500 focus:outline-hidden transition-colors"
                      id="inp-builder-amount"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={() => {
                      const computedName = itemServiceType === "Other" ? (itemCustomServiceType.trim() || "Custom Service") : itemServiceType;
                      if (!computedName) {
                        alert("Please specify a service type name.");
                        return;
                      }
                      if (itemAmount <= 0) {
                        alert("Please enter a valid amount.");
                        return;
                      }
                      
                      setSelectedServicesList([...selectedServicesList, { serviceType: computedName, amount: itemAmount }]);
                      setItemCustomServiceType("");
                      setItemAmount(0);
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold font-mono text-xs py-2 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer h-[38px]"
                    id="btn-add-builder-item"
                  >
                    <span>+ Add Item</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Conditional Custom Service input */}
          {serviceType === "Other" && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 animate-fadeIn">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Specify Custom Rehabilitation Service
              </label>
              <input
                type="text"
                placeholder="e.g., Speech Therapy Consultation-Premium"
                value={customServiceType}
                onChange={(e) => setCustomServiceType(e.target.value)}
                className="w-full text-xs font-medium border border-slate-300 rounded-lg py-2 px-3 bg-white focus:border-emerald-500 focus:outline-hidden transition-colors"
                id="inp-custom-service"
              />
            </div>
          )}

          {/* GST Option Section */}
          <div className="bg-slate-50/80 rounded-xl border border-slate-200 p-4.5 space-y-3.5" id="gst-taxation-panel">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 font-display uppercase tracking-wider">
                  <span className="px-1.5 py-0.5 bg-emerald-600 text-white text-[10px] font-black rounded font-mono">GST</span>
                  GST Invoice Billing Options
                </label>
                <p className="text-[10px] text-slate-500 font-semibold">Enable tax calculation for GST compliant invoice printing.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={gstEnabled}
                  onChange={(e) => setGstEnabled(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer accent-emerald-600"
                  id="chk-gst-enabled"
                />
                <span className="ml-2 text-xs font-black text-slate-700">Enable GST</span>
              </label>
            </div>

            {gstEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 animate-fadeIn">
                {/* GST Rate Select */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    GST Rate / Slab (%)
                  </label>
                  <select
                    value={gstRate}
                    onChange={(e) => setGstRate(parseInt(e.target.value, 10))}
                    className="w-full text-xs font-bold border border-slate-300 rounded-lg py-2 px-3 bg-white focus:border-emerald-500 focus:outline-hidden cursor-pointer"
                    id="sel-gst-rate"
                  >
                    <option value={18}>18% (Standard Diagnostic/Service)</option>
                    <option value={12}>12% (Medical Devices/Hearing Aids)</option>
                    <option value={5}>5% (Life Saving Drugs)</option>
                    <option value={28}>28% (Luxury Items)</option>
                  </select>
                </div>

                {/* GST Type Select */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    GST Calculation Type
                  </label>
                  <div className="flex bg-white border border-slate-300 p-0.5 rounded-lg gap-1">
                    <button
                      type="button"
                      onClick={() => setGstType("inclusive")}
                      className={`flex-1 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${gstType === "inclusive" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-800"}`}
                      id="btn-gst-inclusive"
                    >
                      Inclusive (In price)
                    </button>
                    <button
                      type="button"
                      onClick={() => setGstType("exclusive")}
                      className={`flex-1 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${gstType === "exclusive" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-800"}`}
                      id="btn-gst-exclusive"
                    >
                      Exclusive (Add extra)
                    </button>
                  </div>
                </div>

                {/* Live calculation breakdown */}
                <div className="sm:col-span-2 bg-emerald-50/40 border border-emerald-100 p-3 rounded-lg text-xs space-y-1 mt-1 font-mono">
                  <div className="flex justify-between text-slate-500 font-semibold">
                    <span>Taxable Base Value (Subtotal):</span>
                    <span className="font-bold">
                      ₹{(() => {
                        const subtotal = isMultipleServices
                          ? selectedServicesList.reduce((sum, item) => sum + item.amount, 0)
                          : grossAmount;
                        const afterDiscount = Math.max(0, subtotal - discount);
                        if (gstType === "inclusive") {
                          return (afterDiscount / (1 + gstRate / 100)).toFixed(2);
                        }
                        return afterDiscount.toFixed(2);
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 font-semibold">
                    <span>CGST ({gstRate / 2}%):</span>
                    <span className="font-bold">
                      ₹{(() => {
                        const subtotal = isMultipleServices
                          ? selectedServicesList.reduce((sum, item) => sum + item.amount, 0)
                          : grossAmount;
                        const afterDiscount = Math.max(0, subtotal - discount);
                        let calculatedGst = 0;
                        if (gstType === "inclusive") {
                          calculatedGst = afterDiscount - (afterDiscount / (1 + gstRate / 100));
                        } else {
                          calculatedGst = (afterDiscount * gstRate) / 100;
                        }
                        return (calculatedGst / 2).toFixed(2);
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 font-semibold">
                    <span>SGST ({gstRate / 2}%):</span>
                    <span className="font-bold">
                      ₹{(() => {
                        const subtotal = isMultipleServices
                          ? selectedServicesList.reduce((sum, item) => sum + item.amount, 0)
                          : grossAmount;
                        const afterDiscount = Math.max(0, subtotal - discount);
                        let calculatedGst = 0;
                        if (gstType === "inclusive") {
                          calculatedGst = afterDiscount - (afterDiscount / (1 + gstRate / 100));
                        } else {
                          calculatedGst = (afterDiscount * gstRate) / 100;
                        }
                        return (calculatedGst / 2).toFixed(2);
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-800 font-black pt-1.5 border-t border-emerald-100 mt-1">
                    <span>Total Bill Amount Collected:</span>
                    <span className="text-emerald-700">₹{amountCollected}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Auto generated read-only indicators */}
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-3.5 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5 flex items-center gap-1">
                <Hash className="w-3 h-3 text-slate-400" /> Auto-Generated Case Pt ID
              </p>
              <p className="text-xs font-mono font-bold text-slate-700 bg-white border border-slate-300/60 px-2.5 py-1 rounded-md max-w-max">
                {patientId || "Generating..."}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5 flex items-center gap-1">
                <FileText className="w-3 h-3 text-slate-400" /> Auto-Generated Bill No
              </p>
              <p className="text-xs font-mono font-bold text-slate-700 bg-white border border-slate-300/60 px-2.5 py-1 rounded-md max-w-max truncate">
                {billNo || "Generating..."}
              </p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Remarks / Clinical Notes
            </label>
            <textarea
              placeholder="e.g., Patient showed significant compliance. Referred by Dr. Bhattacharya."
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2.5 focus:border-emerald-500 focus:outline-hidden transition-colors"
              id="txt-remarks-notes"
            />
          </div>

        </div>

        {/* Card Footer / Submit section */}
        <div className="bg-slate-50 px-5 py-4 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold font-mono text-xs py-2.5 px-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
            id="btn-submit-entry"
          >
            <Save className="w-4 h-4" />
            <span>{editingEntry ? "Update & Save Patient Entry" : "Register Patient Collection"}</span>
          </button>
        </div>

      </div>

    </form>
  );
}
