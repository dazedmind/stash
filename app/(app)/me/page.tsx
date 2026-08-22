"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  BsArrowDownRight,
  BsArrowUpRight,
  BsBoxArrowRight,
  BsCheckLg,
  BsChevronRight,
  BsCreditCard,
  BsGear,
  BsLightningCharge,
  BsPerson,
  BsPieChart,
  BsWallet2,
  BsExclamationTriangle,
  BsTrash,
} from "react-icons/bs";
import { AuthModal } from "../../components/AuthModal";
import { StashSelectCard } from "../../components/StashSelectCard";
import { formatCurrency } from "../../lib/finance";
import { useApp } from "../../lib/store";

interface TransactionLog {
  id: string;
  type: "income" | "expense" | "transfer_internal" | "transfer_sub";
  amount: number;
  source: string | null;
  description: string | null;
  subCategoryName: string | null;
  createdAt: string;
}

interface PayLaterItem {
  id: string;
  name: string;
  totalAmount: number;
  monthlyPayment: number;
}

export default function MePage() {
  const {
    user,
    isAuthenticated,
    logout,
    totalBalance,
    totalDigital,
    totalCash,
    categories,
    allSubcategories,
    refreshData,
  } = useApp();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<TransactionLog[]>([]);
  const [payLaters, setPayLaters] = useState<PayLaterItem[]>([]);
  const [overflowSubId, setOverflowSubId] = useState<string>("");

  // Delete account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [txRes, plRes] = await Promise.all([
          fetch("/api/finance/transactions"),
          fetch("/api/pay-later"),
        ]);
        const txData = await txRes.json();
        const plData = await plRes.json();

        if (txData.transactions) setTransactions(txData.transactions);
        if (plData.payLaters) setPayLaters(plData.payLaters);
      } catch (err) {
        console.error("Dashboard load error:", err);
      }
    }
    loadDashboardData();

    const firstSub = allSubcategories[0]?.id || "";
    const savedOverflow = localStorage.getItem("global_overflow_sub_id") || firstSub;
    setOverflowSubId(savedOverflow);
  }, [allSubcategories]);

  useEffect(() => {
    if (showDeleteModal) {
      setDeleteConfirmText("");
      setTimeout(() => deleteInputRef.current?.focus(), 300);
    }
  }, [showDeleteModal]);

  function handleSaveOverflowSetting(subId: string) {
    setOverflowSubId(subId);
    localStorage.setItem("global_overflow_sub_id", subId);
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== "DELETE" || isDeleting) return;
    setIsDeleting(true);
    try {
      const res = await fetch("/api/auth/me", { method: "DELETE" });
      if (res.ok) await logout();
    } catch (err) {
      console.error("Delete account error:", err);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  }

  // Compute Current Month Metrics
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthTxs = transactions.filter((tx) => {
    const d = new Date(tx.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const currentDayTxs = currentMonthTxs.filter((tx) => {
    const d = new Date(tx.createdAt);
    return d.getDate() === now.getDate() && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const monthlySpent = currentMonthTxs
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const dailySpent = currentDayTxs
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const monthlyIncomeDeposits = currentMonthTxs
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const netCashflow = monthlyIncomeDeposits - monthlySpent;

  const digitalPct = totalBalance > 0 ? Math.round((totalDigital / totalBalance) * 100) : 0;
  const cashPct = totalBalance > 0 ? Math.round((totalCash / totalBalance) * 100) : 0;

  const categorySpendMap: Record<string, number> = {};
  for (const tx of currentMonthTxs) {
    if (tx.type === "expense") {
      const name = tx.subCategoryName || "General Expense";
      categorySpendMap[name] = (categorySpendMap[name] || 0) + tx.amount;
    }
  }

  const topSpendCategories = Object.entries(categorySpendMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const activePayLaters = payLaters.length;
  const totalMonthlyPayLater = payLaters.reduce((acc, pl) => acc + (pl.monthlyPayment || 0), 0);

  // ── Authenticated: Account overview (original layout) ──────────────────────
  return (
    <>
      <div className="animate-fade-in max-w-2xl mx-auto space-y-4 px-4 py-4 pb-20">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              ACCOUNT & INSIGHTS
            </span>
            <h1 className="text-xl font-bold tracking-tight text-zinc-100">Overview</h1>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex min-h-[36px] items-center gap-1.5 rounded-xl bg-zinc-900 px-3 text-xs font-semibold text-zinc-300 transition-all hover:bg-zinc-800 hover:text-white active:scale-95"
          >
            <BsBoxArrowRight className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </header>

        {/* Profile Banner — tappable, navigates to settings */}
        <Link
          href="/settings"
          className="flex items-center gap-3.5 rounded-2xl bg-zinc-900/60 p-4 border border-zinc-800/40 hover:bg-zinc-900 transition-colors"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-400 font-bold text-zinc-950 text-lg">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-bold text-base text-zinc-100">
                {user?.name || "My Account"}
              </p>
              <span className="inline-flex items-center rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                Synced
              </span>
            </div>
            <p className="mt-0.5 text-xs text-zinc-400 truncate">{user?.email}</p>
          </div>
          <BsChevronRight className="h-4 w-4 text-zinc-500 shrink-0" />
        </Link>

        {/* KPI Grid */}
        <section className="grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl bg-zinc-900/60 p-4 border border-zinc-800/40">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-medium">Daily Spent</span>
              <BsArrowUpRight className="h-3.5 w-3.5 text-zinc-500" />
            </div>
            <p className="mt-2 text-xl font-bold tabular-nums text-zinc-100">
              {formatCurrency(dailySpent)}
            </p>
            <p className="mt-1 text-[11px] text-zinc-500 font-medium">This day</p>
          </div>

          <div className="rounded-2xl bg-zinc-900/60 p-4 border border-zinc-800/40">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-medium">Total Balance</span>
              <BsWallet2 className="h-3.5 w-3.5 text-zinc-500" />
            </div>
            <p className="mt-2 text-xl font-bold tabular-nums text-zinc-100">
              {formatCurrency(totalBalance)}
            </p>
            <p className="mt-1 text-[11px] text-zinc-500 font-medium">All stashes</p>
          </div>
        </section>

        {/* Allocation & Overflow Settings */}
        <section className="rounded-2xl bg-zinc-900/60 p-4 border border-zinc-800/40 space-y-3">
          <div className="flex items-center gap-2">
            <BsGear className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-zinc-200">Allocation & Overflow Settings</h2>
          </div>
          <div className="space-y-2 pt-1">
            <div className="pt-1">
              <StashSelectCard
                dropUp
                label="Default Overflow Target Stash"
                selectedSubId={overflowSubId}
                categories={categories}
                onSelect={(subId) => handleSaveOverflowSetting(subId)}
              />
            </div>
          </div>
        </section>

        {/* Pay Later Summary */}
        {activePayLaters > 0 && (
          <section className="rounded-2xl bg-zinc-900/60 p-4 border border-zinc-800/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BsCreditCard className="h-4 w-4 text-zinc-400" />
                <h2 className="text-sm font-semibold text-zinc-200">Pay Later Commitments</h2>
              </div>
              <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs font-semibold text-zinc-300">
                {activePayLaters} Active
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-medium">Monthly Installments:</span>
              <span className="font-bold tabular-nums text-zinc-100">
                {formatCurrency(totalMonthlyPayLater)}
              </span>
            </div>
          </section>
        )}
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
          <button type="button" className="absolute inset-0 bg-black/80" onClick={() => setShowDeleteModal(false)} />
          <div className="relative w-full max-w-sm rounded-3xl bg-zinc-950 p-6 shadow-2xl border border-zinc-800/60">
            <div className="flex flex-col items-center text-center mb-5">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10">
                <BsExclamationTriangle className="h-7 w-7 text-rose-400" />
              </div>
              <h2 className="text-lg font-bold text-zinc-100">Delete Account</h2>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                This will permanently delete your account and all your stash data. This action{" "}
                <strong className="text-zinc-200">cannot be undone</strong>.
              </p>
            </div>
            <label className="block mb-4">
              <span className="text-xs font-medium text-zinc-400">
                Type <strong className="text-zinc-200">DELETE</strong> to confirm
              </span>
              <input
                ref={deleteInputRef}
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="mt-2 w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-bold text-zinc-100 outline-none focus:ring-1 focus:ring-rose-500 tracking-widest"
              />
            </label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowDeleteModal(false)} className="flex-1 rounded-xl bg-zinc-900 py-3 text-sm font-bold text-zinc-300 hover:bg-zinc-800">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "DELETE" || isDeleting}
                className="flex-1 rounded-xl bg-rose-500 py-3 text-sm font-bold text-white hover:bg-rose-400 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Deleting…" : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
