/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IncomeEntry } from "./types";

export const DEMO_ENTRIES: IncomeEntry[] = [
  {
    id: "demo-1",
    patientName: "Ananya Sengupta",
    patientId: "PT-20260412-1045",
    patientContact: "9830098300",
    date: "2026-04-12",
    paymentDate: "2026-04-12",
    serviceType: "Hearing Aid Trial & Fitting",
    amountCollected: 18500,
    paymentMode: "Card Payment",
    notes: "Completed fitting of Signia Pure 1X receiver-in-canal instrument. High compliance model.",
    clinicLocation: "Bata Mall (HQ)",
    billNo: "BRG-BILL-20260412-50121",
    referredDoctor: "Dr. S. K. Roy",
    aslpName: "Atanu Saha",
    expenses: {
      doctorReferral: 2775,        // 15%
      audiologistCommission: 1850, // 10%
      clinicShare: 8325,           // 45% (was 55%)
      anyServiceCharges: 925,      // 5%
      supportStaffCommission: 925, // 5%
      otherExpenses: 1850,         // 10%
      brgProfit: 1850              // 10%
    },
    createdTime: "2026-04-12T11:00:00Z"
  },
  {
    id: "demo-2",
    patientName: "Rahul Chatterjee",
    patientId: "PT-20260424-2092",
    patientContact: "9876543210",
    date: "2026-04-24",
    paymentDate: "2026-04-25", // paid next day
    serviceType: "Speech Therapy Session",
    amountCollected: 1500,
    paymentMode: "Mobile Banking (UPI)",
    notes: "Session 4 for post-stroke aphasia recovery. Excellent responsive tongue exercises recorded.",
    clinicLocation: "Giris Park",
    billNo: "BRG-BILL-20260424-91024",
    referredDoctor: "Self / Direct Walk-In",
    aslpName: "Sudeshna Maitra",
    expenses: {
      doctorReferral: 0,           // Direct Walk-In preset
      audiologistCommission: 225,  // 15%
      clinicShare: 825,            // 55%
      anyServiceCharges: 75,       // 5%
      supportStaffCommission: 75,  // 5%
      otherExpenses: 150,          // 10%
      brgProfit: 150               // 10%
    },
    createdTime: "2026-04-24T15:30:00Z"
  },
  {
    id: "demo-3",
    patientName: "Sourav Ganguly Jr.",
    patientId: "PT-20260505-6541",
    patientContact: "9007090070",
    date: "2026-05-05",
    paymentDate: "2026-05-05",
    serviceType: "Audio+Tymp",
    amountCollected: 2400,
    paymentMode: "Cash",
    notes: "Impedance/Bera assessments completed under pediatric protocols. Advised hearing aid evaluation.",
    clinicLocation: "Howarah Clinic",
    billNo: "BRG-BILL-20260505-84013",
    referredDoctor: "Dr. Amit Sen",
    aslpName: "Atanu Saha",
    expenses: {
      doctorReferral: 360,
      audiologistCommission: 240,
      clinicShare: 1080,
      anyServiceCharges: 120,
      supportStaffCommission: 120,
      otherExpenses: 240,
      brgProfit: 240
    },
    createdTime: "2026-05-05T09:45:00Z"
  },
  {
    id: "demo-4",
    patientName: "Meenakshi Dhar",
    patientId: "PT-20260515-8812",
    patientContact: "9831298312",
    date: "2026-05-15",
    paymentDate: "2026-05-14", // advanced payment
    serviceType: "Cochlear Implant Rehabilitation",
    amountCollected: 8000,
    paymentMode: "Net Banking",
    notes: "Auditory verbal mapping and rehabilitation block. Processed referral from Apollo Hospitals.",
    clinicLocation: "Bata Mall (HQ)",
    billNo: "BRG-BILL-20260515-32114",
    referredDoctor: "Dr. P. Dhar (Apollo)",
    aslpName: "Koyel Ghosh",
    expenses: {
      doctorReferral: 1200,
      audiologistCommission: 800,
      clinicShare: 3600,
      anyServiceCharges: 400,
      supportStaffCommission: 400,
      otherExpenses: 800,
      brgProfit: 800
    },
    createdTime: "2026-05-15T10:00:00Z"
  },
  {
    id: "demo-5",
    patientName: "Indranil Mukherjee",
    patientId: "PT-20260520-2210",
    date: "2026-05-20",
    serviceType: "Custom Ear Mold Fabrication",
    amountCollected: 4500,
    paymentMode: "Cash",
    notes: "High Cost / Hearing Aids preset. Bilateral silicon molds sent to laboratory for curing.",
    clinicLocation: "Tata 1mg",
    billNo: "BRG-BILL-20260520-74011",
    referredDoctor: "Dr. Joydeep Pal",
    aslpName: "Atanu Saha",
    expenses: {
      doctorReferral: 450,          // 10%
      audiologistCommission: 360,   // 8%
      clinicShare: 1350,            // 30%
      anyServiceCharges: 1350,      // 30% Higher service / lab cost
      supportStaffCommission: 180,  // 4%
      otherExpenses: 360,            // 8%
      brgProfit: 450                // 10%
    },
    createdTime: "2026-05-20T14:15:00Z"
  },
  {
    id: "demo-6",
    patientName: "Rupali Banerjee",
    patientId: "PT-20260525-4501",
    date: "2026-05-25",
    serviceType: "Speech Therapy Session",
    amountCollected: 1500,
    paymentMode: "Mobile Banking (UPI)",
    notes: "Stuttering stabilization therapy session for school student. Substantial improvement tracked.",
    clinicLocation: "ENH",
    billNo: "BRG-BILL-20260525-50125",
    referredDoctor: "Self / Direct Walk-In",
    aslpName: "Sudeshna Maitra",
    expenses: {
      doctorReferral: 0,
      audiologistCommission: 225,
      clinicShare: 825,
      anyServiceCharges: 75,
      supportStaffCommission: 75,
      otherExpenses: 150,
      brgProfit: 150
    },
    createdTime: "2026-05-25T11:45:00Z"
  }
];
