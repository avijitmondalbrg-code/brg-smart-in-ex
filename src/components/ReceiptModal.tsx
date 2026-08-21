/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from "react";
import { IncomeEntry } from "../types";
import { 
  X, 
  Printer, 
  ShieldCheck, 
  Building2, 
  Calendar, 
  User, 
  FileText, 
  Sparkles, 
  CreditCard,
  Maximize2,
  Minimize2
} from "lucide-react";

interface ReceiptModalProps {
  entry: IncomeEntry | null;
  onClose: () => void;
}

export default function ReceiptModal({ entry, onClose }: ReceiptModalProps) {
  if (!entry) return null;

  const [isFullscreen, setIsFullscreen] = useState(false);

  // Close on Escape key or handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, onClose]);

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  const discount = entry.discount || 0;
  const hasDiscount = discount > 0;
  const subtotal = entry.selectedServices && entry.selectedServices.length > 0
    ? entry.selectedServices.reduce((sum, s) => sum + s.amount, 0)
    : (entry.amountCollected + discount);

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR"
    }).format(amt);
  };

  const numberToWordsINR = (num: number): string => {
    if (isNaN(num) || num === null || num === undefined) return "";
    const rounded = Math.round(num * 100) / 100;
    if (rounded === 0) return "Rupees Zero Only";

    const ones = [
      "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
      "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
      "Seventeen", "Eighteen", "Nineteen"
    ];
    const tens = [
      "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
    ];

    const convertLessThanThousand = (n: number): string => {
      let result = "";
      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + " Hundred ";
        n %= 100;
      }
      if (n >= 20) {
        result += tens[Math.floor(n / 10)] + " ";
        n %= 10;
      }
      if (n > 0) {
        result += ones[n] + " ";
      }
      return result.trim();
    };

    const integerPart = Math.floor(rounded);
    const decimalPart = Math.round((rounded - integerPart) * 100);

    let words = "";

    const crore = Math.floor(integerPart / 10000000);
    let rem = integerPart % 10000000;

    const lakh = Math.floor(rem / 100000);
    rem %= 100000;

    const thousand = Math.floor(rem / 1000);
    rem %= 1000;

    const hundred = rem;

    if (crore > 0) {
      words += convertLessThanThousand(crore) + " Crore ";
    }
    if (lakh > 0) {
      words += convertLessThanThousand(lakh) + " Lakh ";
    }
    if (thousand > 0) {
      words += convertLessThanThousand(thousand) + " Thousand ";
    }
    if (hundred > 0) {
      words += convertLessThanThousand(hundred) + " ";
    }

    words = words.trim();
    let finalStr = words ? `Rupees ${words}` : "Rupees Zero";

    if (decimalPart > 0) {
      const paiseWords = convertLessThanThousand(decimalPart);
      finalStr += ` and ${paiseWords} Paise`;
    }

    return `${finalStr} Only`;
  };

  return (
    <div 
      className={`fixed inset-0 z-50 overflow-y-auto ${
        isFullscreen ? "bg-slate-950/95 flex flex-col" : ""
      }`} 
      role="dialog" 
      aria-modal="true" 
      id="receipt-modal-bg"
    >
      {/* Backdrop (in standard mode) */}
      {!isFullscreen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity no-print" 
          onClick={onClose} 
        />
      )}

      {/* Top sticky action helper bar for Fullscreen Mode */}
      {isFullscreen && (
        <div className="no-print bg-slate-900 border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-white font-display">Medical Receipt Preview</h2>
                <span className="bg-blue-900/60 text-blue-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-blue-700/50">
                  Full Screen Mode
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Press Esc or click Exit to restore standard view</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
              id="btn-print-receipt-fullscreen"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              id="btn-toggle-fullscreen-active"
              title="Exit Full Screen"
            >
              <Minimize2 className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">Exit Fullscreen</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl border border-slate-700 transition-colors cursor-pointer"
              id="btn-close-receipt-fullscreen"
              title="Close Preview"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container Wrapper */}
      <div className={`
        ${isFullscreen 
          ? "flex-1 p-4 sm:p-8 flex justify-center items-start overflow-y-auto" 
          : "flex min-h-full items-center justify-center p-3 sm:p-6 lg:p-8"
        }
      `}>
        
        {/* Modal Sheet Container */}
        <div className={`
          relative transform overflow-hidden rounded-2xl bg-white text-slate-800 shadow-2xl transition-all w-full border border-slate-300
          ${isFullscreen ? "max-w-4xl my-auto" : "max-w-3xl"}
        `}>
          
          {/* Top action helper (in standard mode) */}
          {!isFullscreen && (
            <div className="no-print bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4.5 h-4.5 text-blue-600" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-display">Medical Receipt Preview</h2>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  id="btn-toggle-fullscreen"
                  title="Full Screen View"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline text-[11px] font-semibold">Full Screen</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-lg transition-all cursor-pointer shadow-xs"
                  id="btn-print-receipt-modal"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Invoice</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer ml-1"
                  id="btn-close-receipt-modal"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Printable Invoice Block */}
          <div className="p-6 sm:p-10 space-y-6 font-sans select-text bg-white" id="printable-receipt-card">
            
            {/* 1. Header with custom Branded Logo */}
            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4 pb-6 border-b-2 border-slate-200">
              <div className="text-center sm:text-left space-y-1.5">
                <img 
                  src="https://www.bengalrehabilitationgroup.com/images/brg_logo.png" 
                  alt="Bengal Rehabilitation Group" 
                  className="h-12 w-auto object-contain mx-auto sm:mx-0"
                  referrerPolicy="no-referrer"
                />
                <h3 className="text-[17px] font-black tracking-tight text-blue-950 font-display uppercase">
                  BRG REHAB HUB
                </h3>
                <p className="text-[10px] text-slate-500 font-medium whitespace-pre-line leading-relaxed">
                  A Unit of Bengal Rehabilitation & Research Pvt. Ltd.
                  Kolkata, West Bengal, India • Contact: 6291236283 | 9830447176; infobrg18@gmail.com
                </p>
                <p className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-sm max-w-max mx-auto sm:mx-0 font-mono">
                  GSTIN: 19AALCB1534C1ZY
                </p>
              </div>

              {/* Bill Meta block */}
              <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-100 text-center sm:text-right space-y-1 sm:min-w-[180px]">
                <span className="inline-block bg-blue-600 text-white font-extrabold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
                  PAID RECEIVED
                </span>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bill Number</p>
                <p className="font-mono text-xs font-black text-blue-900">{entry.billNo}</p>
                <p className="text-[10px] text-slate-500 mt-1 font-semibold">{entry.clinicLocation}</p>
              </div>
            </div>

            {/* 2. Patient Profile Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-semibold">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="text-slate-500">Patient Name:</span>
                  <span className="text-slate-800 font-bold">{entry.patientName}</span>
                </div>
                {entry.patientContact && (
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500 shrink-0">📞</span>
                    <span className="text-slate-500">Mobile No:</span>
                    <span className="text-blue-700 font-bold font-mono">{entry.patientContact}</span>
                  </div>
                )}
                {entry.patientAddress && (
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500 shrink-0">🏠</span>
                    <span className="text-slate-500">Address:</span>
                    <span className="text-slate-800 font-medium break-words leading-relaxed max-w-[220px]">{entry.patientAddress}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="text-slate-500">Patient ID:</span>
                  <span className="text-slate-800 font-mono font-bold">{entry.patientId}</span>
                </div>
                {entry.referredDoctor && (
                  <div className="flex items-center gap-2 pt-0.5">
                    <User className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-slate-500">Referred By:</span>
                    <span className="text-blue-900 font-bold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-sm">{entry.referredDoctor}</span>
                  </div>
                )}
                {entry.aslpName && (
                  <div className="flex items-center gap-2 pt-0.5">
                    <User className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-slate-500">ASLP (Audiologist):</span>
                    <span className="text-blue-900 font-bold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-sm">{entry.aslpName}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-left sm:text-right sm:self-end">
                <div className="flex items-center gap-2 justify-start sm:justify-end">
                  <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="text-slate-500">Service Date:</span>
                  <span className="text-slate-800 font-mono">{entry.date}</span>
                </div>
                 {entry.paymentDate && (
                  <div className="flex items-center gap-2 justify-start sm:justify-end">
                    <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="text-slate-500">Payment Date:</span>
                    {entry.paymentDate === "Pending" ? (
                      <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full select-none animate-pulse">
                        ⚠️ Pending / Due
                      </span>
                    ) : (
                      <span className="text-slate-800 font-mono">{entry.paymentDate}</span>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2 justify-start sm:justify-end">
                  <CreditCard className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="text-slate-500">Method:</span>
                  <span className="text-slate-800 font-semibold">{entry.paymentMode}</span>
                </div>
              </div>
            </div>

            {/* 3. Itemized Medical Treatment service descriptor */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Treatment Description</p>
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                {/* Table Header */}
                <div className="grid grid-cols-12 bg-blue-50/60 py-2.5 px-4 font-bold text-blue-950 border-b border-slate-200">
                  <div className="col-span-8">Description of Services</div>
                  <div className="col-span-4 text-right font-bold">Collected Amount</div>
                </div>

                {/* Table Row or Multiple Rows */}
                {entry.selectedServices && entry.selectedServices.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {entry.selectedServices.map((service, idx) => (
                      <div className="grid grid-cols-12 py-3 px-4 bg-white items-center" key={idx}>
                        <div className="col-span-8">
                          <p className="font-bold text-slate-800 flex items-center gap-2 flex-wrap">
                            <span>{service.serviceType}</span>
                            {service.quantity && service.quantity > 1 && (
                              <span className="inline-flex px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[9px] font-mono font-bold select-none">
                                QTY: {service.quantity}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="col-span-4 text-right font-mono font-bold text-slate-800 text-[12.5px]">
                          {formatCurrency(service.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-12 py-3.5 px-4 bg-white items-center">
                    <div className="col-span-8">
                      <p className="font-bold text-slate-800 flex items-center gap-2 flex-wrap">
                        <span>{entry.serviceType}</span>
                        {entry.quantity && entry.quantity > 1 && (
                          <span className="inline-flex px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[9px] font-mono font-bold select-none">
                            QTY: {entry.quantity}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="col-span-4 text-right font-mono font-bold text-slate-800 text-[13px]">
                      {formatCurrency(entry.amountCollected)}
                    </div>
                  </div>
                )}

                {/* Table Footer */}
                {hasDiscount && (
                  <div className="grid grid-cols-12 bg-slate-50/50 py-2 px-4 text-xs font-semibold text-slate-500 border-t border-slate-200 items-center">
                    <div className="col-span-8 text-right font-display text-[10px] uppercase tracking-wider">Gross Subtotal:</div>
                    <div className="col-span-4 text-right font-mono font-bold text-slate-700">
                      {formatCurrency(subtotal)}
                    </div>
                  </div>
                )}
                {hasDiscount && (
                  <div className="grid grid-cols-12 bg-rose-50/40 py-2 px-4 text-xs font-semibold text-rose-600 items-center border-t border-slate-100">
                    <div className="col-span-8 text-right font-display text-[10px] uppercase tracking-wider">Discount Applied:</div>
                    <div className="col-span-4 text-right font-mono font-bold">
                      -{formatCurrency(discount)}
                    </div>
                  </div>
                )}

                {entry.gstEnabled && (
                  <>
                    <div className="grid grid-cols-12 bg-slate-50/50 py-2 px-4 text-xs font-semibold text-slate-500 border-t border-slate-200 items-center">
                      <div className="col-span-8 text-right font-display text-[10px] uppercase tracking-wider">Taxable Value (Subtotal):</div>
                      <div className="col-span-4 text-right font-mono font-bold text-slate-700">
                        {formatCurrency(entry.amountCollected - (entry.gstAmount || 0))}
                      </div>
                    </div>
                    <div className="grid grid-cols-12 bg-slate-50/50 py-2 px-4 text-xs font-semibold text-slate-500 border-t border-slate-100 items-center">
                      <div className="col-span-8 text-right font-display text-[10px] uppercase tracking-wider">CGST ({(entry.gstRate || 18) / 2}%):</div>
                      <div className="col-span-4 text-right font-mono font-bold text-slate-700">
                        {formatCurrency(entry.cgstAmount || ((entry.gstAmount || 0) / 2))}
                      </div>
                    </div>
                    <div className="grid grid-cols-12 bg-slate-50/50 py-2 px-4 text-xs font-semibold text-slate-500 border-t border-slate-100 items-center">
                      <div className="col-span-8 text-right font-display text-[10px] uppercase tracking-wider">SGST ({(entry.gstRate || 18) / 2}%):</div>
                      <div className="col-span-4 text-right font-mono font-bold text-slate-700">
                        {formatCurrency(entry.sgstAmount || ((entry.gstAmount || 0) / 2))}
                      </div>
                    </div>
                  </>
                )}
                <div className="grid grid-cols-12 bg-blue-50/40 py-3 px-4 font-bold text-slate-800 border-t border-slate-200 items-center">
                  <div className="col-span-8 text-right text-slate-600 font-display">TOTAL AMOUNT:</div>
                  <div className="col-span-4 text-right font-mono font-extrabold text-[15px] text-blue-700">
                    {formatCurrency(entry.amountCollected)}
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Amount in Words */}
            <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-baseline gap-1.5 sm:gap-2 text-xs">
              <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider shrink-0 font-display">
                Amount in Words:
              </span>
              <span className="font-bold text-blue-950 italic font-mono text-[11.5px]">
                {numberToWordsINR(entry.amountCollected)}
              </span>
            </div>

            {/* User notes if existing */}
            {entry.notes && (
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5 text-xs text-blue-900 leading-relaxed italic">
                <strong>Patient Remarks:</strong> "{entry.notes}"
              </div>
            )}

            {/* 5. Footer & Clinical Signatures */}
            <div className="pt-8 border-t border-dashed border-slate-300 flex flex-col sm:flex-row justify-between items-end gap-6 text-[10px] text-slate-400 font-semibold text-center sm:text-left">
              <div className="space-y-1">
                <p>This is a computer-generated statement directly tracked upon payment authorization.</p>
                <p>Thanks for choosing Bengal Rehabilitation Group.</p>
              </div>
              
              {/* Authorized Stamp & Signature Space (with extra gap for physical stamp) */}
              <div className="w-48 text-center space-y-1">
                {/* Generous physical stamp area gap */}
                <div className="h-16 w-full flex items-center justify-center border border-dashed border-slate-200/80 rounded-lg bg-slate-50/30 mb-1">
                  <span className="text-[9px] text-slate-300 italic select-none"></span>
                </div>
                <div className="border-b border-slate-400 pb-1">
                  <span className="font-mono text-[9px] text-slate-600 uppercase tracking-widest block font-bold">Authorized Signatory</span>
                </div>
                <span className="font-display font-black text-blue-900 block leading-tight text-[10px] uppercase pt-0.5">
                  BRG REHAB HUB
                </span>
              </div>
            </div>

          </div>

          {/* Quick printer notification banner (hidden during paper print) */}
          <div className="no-print bg-slate-50 border-t border-slate-200 px-6 py-4 text-center text-xs text-slate-500 font-semibold">
            Press <strong className="text-blue-700">Print Invoice</strong> above to launch system printer dialog automatically.
          </div>

        </div>
      </div>
    </div>
  );
}
