/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ExpenseDistribution {
  doctorReferral: number;
  audiologistCommission: number;
  clinicShare: number;
  anyServiceCharges: number;
  supportStaffCommission: number;
  otherExpenses: number;
  brgProfit: number;
}

export interface SelectedServiceItem {
  serviceType: string;
  amount: number;
}

export interface IncomeEntry {
  id: string; // Unique internal tracker ID
  patientName: string;
  patientId: string; // Auto-generated format: PT-YYYYMMDD-XXXX
  date: string; // Entry Date: YYYY-MM-DD
  serviceType: string; // e.g. Hearing Evaluation, Speech Therapy, etc.
  amountCollected: number;
  paymentMode: string; // Cash, Card, Mobile Banking, Net Banking, etc.
  notes: string;
  clinicLocation: string; // Bengal centers
  billNo: string; // Auto-generated: BILL-YYYYMMDD-XXXX
  referredDoctor?: string; // Referring doctor name
  aslpName?: string; // Audiologist name
  expenses: ExpenseDistribution;
  createdTime: string; // Timestamp for search
  selectedServices?: SelectedServiceItem[]; // New field to support multiple services in a single checkout/invoice
}

export interface DistributionPreset {
  name: string;
  doctorReferralPct: number;
  audiologistCommissionPct: number;
  clinicSharePct: number;
  anyServiceChargesPct: number;
  supportStaffCommissionPct: number;
  otherExpensesPct: number;
  brgProfitPct: number;
}

export const CLINIC_LOCATIONS = [
  "Bata Mall (HQ)",
  "Giris Park",
  "ENH",
  "Tata 1mg",
  "Home Care",
  "Howarah Clinic",
  "Online Therapy",
  "Ohters"
];

export const SERVICE_TYPES = [
  "Speech Therapy Session",
  "Audiometry",
  "Tympanometry",
  "Audio+Tymp",
  "Hearing Aid Trial & Fitting",
  "Hearing Aid Reprogramming",
  "Hearing Aid Repair",
  "Cochlear Implant Rehabilitation",
  "Swallow Therapy",
  "Special Audiological Test",
  "Hearing Aid Battery",
  "Custom Ear Mold Fabrication",
  "ENG",
  "OAE",
  "Vertigo Test",
  "Vestibular Test"
];

export const PAYMENT_MODES = [
  "Cash",
  "Card Payment",
  "Mobile Banking (UPI)",
  "Net Banking",
  "Cheque/Draft"
];

export const DEFAULT_DISTRIBUTION_PRESETS: DistributionPreset[] = [
  {
    name: "Standard Referral Case",
    doctorReferralPct: 15,
    audiologistCommissionPct: 10,
    clinicSharePct: 45,
    anyServiceChargesPct: 5,
    supportStaffCommissionPct: 5,
    otherExpensesPct: 10,
    brgProfitPct: 10
  },
  {
    name: "Direct Walk-In Clinic case",
    doctorReferralPct: 0,
    audiologistCommissionPct: 15,
    clinicSharePct: 55,
    anyServiceChargesPct: 5,
    supportStaffCommissionPct: 5,
    otherExpensesPct: 10,
    brgProfitPct: 10
  },
  {
    name: "High Service Cost / Hearing Aids",
    doctorReferralPct: 10,
    audiologistCommissionPct: 8,
    clinicSharePct: 30,
    anyServiceChargesPct: 30, // Higher product or laboratory fabrication costs
    supportStaffCommissionPct: 4,
    otherExpensesPct: 8,
    brgProfitPct: 10
  },
  {
    name: "Equal Redistribution",
    doctorReferralPct: 10,
    audiologistCommissionPct: 10,
    clinicSharePct: 40,
    anyServiceChargesPct: 10,
    supportStaffCommissionPct: 10,
    otherExpensesPct: 10,
    brgProfitPct: 10
  },
  {
    name: "Custom Distribution",
    doctorReferralPct: 10,
    audiologistCommissionPct: 10,
    clinicSharePct: 10,
    anyServiceChargesPct: 10,
    supportStaffCommissionPct: 10,
    otherExpensesPct: 10,
    brgProfitPct: 40
  }
];
