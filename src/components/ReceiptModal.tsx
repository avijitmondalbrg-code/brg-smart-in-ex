/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from "react";
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
  CreditCard 
} from "lucide-react";

interface ReceiptModalProps {
  entry: IncomeEntry | null;
  onClose: () => void;
}

export default function ReceiptModal({ entry, onClose }: ReceiptModalProps) {
  if (!entry) return null;

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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" id="receipt-modal-bg">
      
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity no-print" 
        onClick={onClose} 
      />

      <div className="flex min-h-full items-center justify-center p-4 sm:p-6 lg:p-8">
        
        {/* Modal Container */}
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-slate-800 shadow-2xl transition-all w-full max-w-2xl border border-slate-300">
          
          {/* Top action helper (hidden during actual paper print) */}
          <div className="no-print bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4.5 h-4.5 text-blue-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-display">Medical Receipt Preview</h2>
            </div>
            
            <div className="flex items-center gap-2">
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
                className="p-1 text-slate-400 hover:text-slate-600 rounded bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                id="btn-close-receipt-modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

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
