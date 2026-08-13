/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { IncomeEntry, ExpenseDistribution } from "./types";
import { DEMO_ENTRIES } from "./demo_data";
import Sidebar, { NavTab } from "./components/Sidebar";
import SettingsView from "./components/SettingsView";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import IncomeForm from "./components/IncomeForm";
import TransactionsTable from "./components/TransactionsTable";
import ReceiptModal from "./components/ReceiptModal";
import ExpensesDashboard from "./components/ExpensesDashboard";
import PatientsDatabase from "./components/PatientsDatabase";
import LoginCover from "./components/LoginCover";
import { 
  Building2, 
  Plus, 
  BarChart3, 
  TrendingUp, 
  BriefcaseMedical, 
  Database,
  Sparkles,
  ClipboardList,
  AlertCircle,
  TrendingDown,
  CloudSun,
  Users
} from "lucide-react";
import { 
  db, 
  authenticateSessionAnonymously, 
  terminateSession,
  OperationType,
  handleFirestoreError
} from "./lib/firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from "firebase/firestore";

export default function App() {
  // Session Authentication state Checked from local cache
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem("brg_smart_inex_authorized") === "true";
    } catch (e) {
      return false;
    }
  });

  // User role state
  const [userRole, setUserRole] = useState<string>(() => {
    try {
      return localStorage.getItem("brg_smart_inex_user_role") || "admin";
    } catch (e) {
      return "admin";
    }
  });

  // Primary state holding all financial collections
  const [entries, setEntries] = useState<IncomeEntry[]>([]);
  
  // Tab states: "dashboard" | "ledger" | "expenses" | "patients" | "settings"
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");

  // Mobile sidebar drawer state
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  // Edit statement helper state
  const [editingEntry, setEditingEntry] = useState<IncomeEntry | null>(null);

  // Active receipt printed statement state
  const [receiptEntry, setReceiptEntry] = useState<IncomeEntry | null>(null);

  // User notification toasts state
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" | "danger" } | null>(null);

  // Server Synchronization states
  const [isFirebaseSyncing, setIsFirebaseSyncing] = useState<boolean>(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);

  // Synchronically connect and establish high-fidelity real-time session
  useEffect(() => {
    if (!isLoggedIn) return;

    let unsubscribe: (() => void) | null = null;
    setIsFirebaseSyncing(true);

    const setupFirebaseSession = async () => {
      try {
        // Authenticate anonymously
        await authenticateSessionAnonymously();
        setIsFirebaseConnected(true);

        // Setup real-time listener sorted by createdTime descending
        const collectionRef = collection(db, "entries");
        const q = query(collectionRef, orderBy("createdTime", "desc"));
        
        unsubscribe = onSnapshot(q, (snapshot) => {
          const fetched: IncomeEntry[] = [];
          snapshot.forEach((snapshotDoc) => {
            fetched.push(snapshotDoc.data() as IncomeEntry);
          });
          setEntries(fetched);
          setIsFirebaseSyncing(false);
        }, (error) => {
          setIsFirebaseSyncing(false);
          handleFirestoreError(error, OperationType.LIST, "entries");
        });
      } catch (err: any) {
        console.error("Firebase syncing failed to establish:", err);
        setIsFirebaseSyncing(false);
        const errStr = err instanceof Error ? err.message : String(err);
        
        let friendlyAlert = "Operating offline. Changes will not be sent to the server.";
        if (errStr.includes("auth/operation-not-allowed")) {
          friendlyAlert = "Database connection error: 'Anonymous Sign-In' is disabled in your Firebase console. Please enable it under Auth -> Sign-in Method.";
        } else if (errStr.includes("permission-denied") || errStr.toLowerCase().includes("permission")) {
          friendlyAlert = "Sync Error: Permission Denied. Please ensure your Firestore rules are updated.";
        } else if (errStr.includes("restricted") || errStr.toLowerCase().includes("api key") || errStr.includes("key-not-found")) {
          friendlyAlert = "Invalid API Key: Please verify Firebase configuration environment variables.";
        } else if (errStr.includes("quota") || errStr.toLowerCase().includes("quota exceeded")) {
          friendlyAlert = "Firebase Database Quota Exceeded. Standard free tier limits reached.";
        } else {
          friendlyAlert = `Database offline: ${errStr.substring(0, 130)}`;
        }
        
        triggerNotification(friendlyAlert, "danger");
      }
    };

    setupFirebaseSession();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isLoggedIn]);

  // Helper trigger to show beautiful timed notifications
  const triggerNotification = (msg: string, type: "success" | "info" | "danger" = "success") => {
    setNotification({ message: msg, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleLoginSuccess = (role: string) => {
    try {
      localStorage.setItem("brg_smart_inex_authorized", "true");
      localStorage.setItem("brg_smart_inex_user_role", role);
    } catch (e) {}
    setUserRole(role);
    setIsLoggedIn(true);
    triggerNotification(`Clearance granted as ${role}. Welcome to your ledger space!`, "success");
  };

  const handleLogout = async () => {
    try {
      await terminateSession();
      localStorage.removeItem("brg_smart_inex_authorized");
      localStorage.removeItem("brg_smart_inex_user_role");
    } catch (e) {}
    setIsLoggedIn(false);
    setUserRole("admin");
    triggerNotification("Session terminated securely and signed out.", "info");
  };

  // 1. Submit helper (Handles both CREATE and UPDATE)
  const handleSubmitEntry = async (entryPayload: Omit<IncomeEntry, "id" | "createdTime"> & { id?: string }) => {
    try {
      if (entryPayload.id) {
        // It is an edit callback — write to Firestore doc
        const entryId = entryPayload.id;
        const entryDocRef = doc(db, "entries", entryId);
        
        // Find existing created time or default
        const existingEntry = entries.find(e => e.id === entryId);
        const createdTime = existingEntry ? existingEntry.createdTime : new Date().toISOString();

        const updatedRecord: IncomeEntry = {
          ...entryPayload,
          id: entryId,
          createdTime
        } as IncomeEntry;

        await setDoc(entryDocRef, updatedRecord);
        setEditingEntry(null);
        triggerNotification("Statement updated & synchronized across all centers!", "success");
      } else {
        // It is a new entry creation
        const entryId = `rec-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const newRecord: IncomeEntry = {
          ...entryPayload,
          id: entryId,
          createdTime: new Date().toISOString()
        };

        const entryDocRef = doc(db, "entries", entryId);
        await setDoc(entryDocRef, newRecord);
        triggerNotification("Transaction synchronized across all clinics!", "success");
      }
    } catch (error) {
      triggerNotification("Failed write operation. Access denied.", "danger");
      handleFirestoreError(error, OperationType.WRITE, "entries");
    }
  };

  // Update only the expense portion of a transaction
  const handleUpdateExpenses = async (id: string, updatedExpenses: ExpenseDistribution) => {
    try {
      const entryDocRef = doc(db, "entries", id);
      await updateDoc(entryDocRef, { expenses: updatedExpenses });
      triggerNotification("Disbursement allocation updated in real-time!", "success");
    } catch (error) {
      triggerNotification("Failed write operation. Access denied.", "danger");
      handleFirestoreError(error, OperationType.UPDATE, `entries/${id}`);
    }
  };

  // 2. Edit trigger
  const handleEditTrigger = (entry: IncomeEntry) => {
    setEditingEntry(entry);
    // Switch to ledger view to focus inputs
    setActiveTab("ledger");
    // Scroll smoothly to form element
    setTimeout(() => {
      document.getElementById("finance-entry-form")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // 3. Delete clinical recording
  const handleDeleteTrigger = async (id: string) => {
    const pt = entries.find(e => e.id === id);
    const confirmed = window.confirm(`Are you sure you want to permanently delete the financial ledger statement for "${pt?.patientName || "this patient"}"? This operation cannot be undone.`);
    if (confirmed) {
      try {
        await deleteDoc(doc(db, "entries", id));
        triggerNotification("Ledger record swept from central database successfully.", "danger");
        if (editingEntry && editingEntry.id === id) {
          setEditingEntry(null);
        }
      } catch (error) {
        triggerNotification("Failed delete operation. Access denied.", "danger");
        handleFirestoreError(error, OperationType.DELETE, `entries/${id}`);
      }
    }
  };

  // 3.5 Delete whole patient's profile records
  const handleDeleteCompletePatientRecords = async (contact: string) => {
    try {
      const matched = entries.filter(e => e.patientContact?.trim() === contact.trim());
      if (matched.length === 0) return;
      triggerNotification(`Sweeping all records under contact: ${contact}...`, "info");
      for (const e of matched) {
        await deleteDoc(doc(db, "entries", e.id));
      }
      triggerNotification(`Patient profile and associated billing restored logs cleared!`, "danger");
    } catch (error) {
      triggerNotification("Failed database profile purge operation.", "danger");
      handleFirestoreError(error, OperationType.DELETE, `entries/contact/${contact}`);
    }
  };

  // 4. Load realistic demo recordings
  const handleLoadDemo = async () => {
    const confirmed = window.confirm("Do you want to initialize the server database with 15 standard Bengal Rehabilitation therapy records?");
    if (!confirmed) return;

    try {
      triggerNotification("Uploading demo entries. Please wait...", "info");
      for (const record of DEMO_ENTRIES) {
        await setDoc(doc(db, "entries", record.id), record);
      }
      triggerNotification("Bengal dataset initialized and synced online successfully!", "success");
    } catch (error) {
      triggerNotification("Failed uploading demo details to the server.", "danger");
      handleFirestoreError(error, OperationType.WRITE, "entries");
    }
  };

  // 5. Hard Wipe
  const handleClearAll = async () => {
    const confirmed = window.confirm("Warning: This will wipe out ALL synchronized clinical records from the database! Are you sure you wish to perform a central hard reset?");
    if (confirmed) {
      try {
        triggerNotification("Sweeping database. Please wait...", "info");
        for (const e of entries) {
          await deleteDoc(doc(db, "entries", e.id));
        }
        setEditingEntry(null);
        setReceiptEntry(null);
        triggerNotification("Database records completely swept.", "info");
      } catch (error) {
        triggerNotification("Failed sweeping database records.", "danger");
        handleFirestoreError(error, OperationType.DELETE, "entries");
      }
    }
  };

  // 6. JSON Backups exporter
  const handleExportJSON = () => {
    try {
      const rawString = JSON.stringify(entries, null, 2);
      const blob = new Blob([rawString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `BRG_Smart_INEX_Backup_${new Date().toISOString().substring(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      triggerNotification("Encrypted backup download initialized.", "success");
    } catch (e) {
      triggerNotification("Export failed. File system blocked.", "danger");
    }
  };

  // 7. JSON Backups importer
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          triggerNotification("Importing records. Please wait...", "info");
          for (const item of parsed) {
            await setDoc(doc(db, "entries", item.id), item);
          }
          triggerNotification("Financial statements restored & synchronized successfully!", "success");
        } else {
          alert("Invalid file format: Backup payload must contain a valid transactions sequence.");
        }
      } catch (err) {
        alert("Restoration error: Critical corruption inside backup stream JSON.");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // Clear file selector
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#848688]">
        {notification && (
          <div className="no-print fixed top-6 right-4 z-50 animate-fadeIn max-w-sm">
            <div className={`p-4 rounded-xl border shadow-lg flex items-start gap-2.5 ${
              notification.type === "success" ? "bg-emerald-950/90 border-emerald-800 text-emerald-100" :
              notification.type === "danger" ? "bg-rose-950/90 border-rose-800 text-rose-200" :
              "bg-slate-900/90 border-slate-800 text-white"
            }`}>
              <AlertCircle className={`w-4.5 h-4.5 shrink-0 ${
                notification.type === "success" ? "text-emerald-450" :
                notification.type === "danger" ? "text-rose-450" :
                "text-slate-400"
              }`} />
              <div className="text-xs font-semibold">
                {notification.message}
              </div>
            </div>
          </div>
        )}
        <LoginCover onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* Left Navigation Sidebar */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalEntriesCount={entries.length}
        userRole={userRole}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        onLogout={handleLogout}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Dynamic Top Header */}
        <Header 
          onToggleSidebar={() => setIsMobileOpen(!isMobileOpen)}
          totalEntriesCount={entries.length}
          userRole={userRole}
          onLogout={handleLogout}
        />

        {/* Main Content View */}
        <main className={`p-4 sm:p-6 lg:p-8 flex-grow w-full space-y-6 ${receiptEntry ? "no-print" : ""}`}>
          
          {/* Toast Notifications Banner */}
          {notification && (
            <div className="no-print fixed top-20 right-4 z-50 animate-bounce duration-500 max-w-sm">
              <div className={`p-4 rounded-xl border shadow-lg flex items-start gap-2.5 ${
                notification.type === "success" ? "bg-blue-50 border-blue-200 text-blue-900" :
                notification.type === "danger" ? "bg-rose-50 border-rose-200 text-rose-900" :
                "bg-slate-900 border-slate-800 text-white"
              }`}>
                <AlertCircle className={`w-4.5 h-4.5 shrink-0 ${
                  notification.type === "success" ? "text-blue-600" :
                  notification.type === "danger" ? "text-rose-600" :
                  "text-slate-400"
                }`} />
                <div className="text-xs font-semibold">
                  {notification.message}
                </div>
              </div>
            </div>
          )}

          {/* DYNAMIC TAB CONTROLLER RENDERING */}
          {activeTab === "dashboard" ? (
            
            /* VIEW 1: DIAGNOSTIC ANALYTICS DASHBOARD */
            <div className="animate-fadeIn">
              <Dashboard entries={entries} userRole={userRole} />
            </div>

          ) : activeTab === "expenses" ? (
            
            /* VIEW 3: DISBURSEMENT & EXPENSE HEADS */
            <div className="animate-fadeIn">
              <ExpensesDashboard entries={entries} />
            </div>

          ) : activeTab === "patients" ? (

            /* VIEW 4: REGISTERED PATIENT DATABASE DASHBOARD DIRECTORY */
            <div className="animate-fadeIn">
              <PatientsDatabase 
                entries={entries}
                onEdit={(entry) => {
                  setEditingEntry(entry);
                  setActiveTab("ledger");
                }}
                onDelete={handleDeleteTrigger}
                onOpenReceipt={(entry) => setReceiptEntry(entry)}
                onDeleteCompletePatientRecords={handleDeleteCompletePatientRecords}
                userRole={userRole}
              />
            </div>

          ) : activeTab === "settings" ? (

            /* VIEW 5: DATABASE & SYSTEM SETTINGS */
            <div className="animate-fadeIn">
              <SettingsView 
                onLoadDemo={handleLoadDemo}
                onClearAll={handleClearAll}
                onExportJSON={handleExportJSON}
                onImportJSON={handleImportJSON}
                totalEntriesCount={entries.length}
                isFirebaseConnected={isFirebaseConnected}
                isFirebaseSyncing={isFirebaseSyncing}
                userRole={userRole}
                onLogout={handleLogout}
              />
            </div>

          ) : (
            
            /* VIEW 2: DIRECT ENTRY FORM & RECORDINGS LEDGER */
            <div className="space-y-8 animate-fadeIn">
              
              {/* Split layout: Form entry structure */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <BriefcaseMedical className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-800 font-display">
                    {editingEntry ? "Modify Clinical Receipt" : "Create New Financial Entry Slip"}
                  </h2>
                </div>
                <p className="text-xs text-slate-500">
                  Register daily therapeutic intakes with auto-generated billing credentials and custom commissions distribution setup.
                </p>
              </div>

              <IncomeForm 
                onSubmit={handleSubmitEntry}
                editingEntry={editingEntry}
                onCancelEdit={() => setEditingEntry(null)}
                entries={entries}
              />

              {/* Structured Transactions ledger */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="space-y-1">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">
                    Registered Patient Database Logs
                  </h2>
                  <p className="text-xs text-slate-500">Inspect historical statements, review internal service charges, or print formal invoices.</p>
                </div>

                <TransactionsTable 
                  entries={entries}
                  onEdit={handleEditTrigger}
                  onDelete={handleDeleteTrigger}
                  onOpenReceipt={(entry) => setReceiptEntry(entry)}
                  onUpdateExpenses={handleUpdateExpenses}
                  userRole={userRole}
                />
              </div>

            </div>

          )}

        </main>

        {/* Footer */}
        <footer className="no-print bg-white border-t border-slate-200 py-4 mt-auto text-xs text-slate-400 font-semibold font-mono">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <img 
                src="https://www.bengalrehabilitationgroup.com/images/brg_logo.png" 
                alt="BRG Logo" 
                className="h-5 w-auto grayscale opacity-60"
                referrerPolicy="no-referrer"
              />
              <span className="font-sans">© 2026 Bengal Rehabilitation Group. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span>Central Sync Active</span>
              <span>v2.0 Blue Edition</span>
            </div>
          </div>
        </footer>

      </div>

      {/* INVOICE RECEIPTS PRINT DIALOG MODAL */}
      {receiptEntry && (
        <ReceiptModal 
          entry={receiptEntry}
          onClose={() => setReceiptEntry(null)}
        />
      )}

    </div>
  );
}
