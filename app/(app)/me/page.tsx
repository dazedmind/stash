"use client";

import { useEffect, useState } from "react";
import {
  BsArrowDownRight,
  BsArrowUpRight,
  BsBoxArrowRight,
  BsCheckLg,
  BsCreditCard,
  BsGear,
  BsLightningCharge,
  BsPerson,
  BsPieChart,
  BsWallet2,
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

    // Default overflow target selection
    const firstSub = allSubcategories[0]?.id || "";
    const savedOverflow = localStorage.getItem("global_overflow_sub_id") || firstSub;
    setOverflowSubId(savedOverflow);
  }, [allSubcategories]);

  function handleSaveOverflowSetting(subId: string) {
    setOverflowSubId(subId);
    localStorage.setItem("global_overflow_sub_id", subId);
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

  // Digital vs Cash percentages
  const digitalPct = totalBalance > 0 ? Math.round((totalDigital / totalBalance) * 100) : 0;
  const cashPct = totalBalance > 0 ? Math.round((totalCash / totalBalance) * 100) : 0;

  // Expense by category breakdown
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

  // Pay later obligations summary
  const activePayLaters = payLaters.length;
  const totalMonthlyPayLater = payLaters.reduce((acc, pl) => acc + (pl.monthlyPayment || 0), 0);

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
          {isAuthenticated ? (
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 transition-all hover:bg-zinc-800 active:scale-95"
            >
              <BsBoxArrowRight className="h-3.5 w-3.5" />
              Sign Out
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-1.5 text-xs font-bold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-95"
            >
              <BsPerson className="h-3.5 w-3.5" />
              Sign In
            </button>
          )}
        </header>

        {/* Minimalist User Account Profile Banner */}
        <section className="rounded-2xl bg-zinc-900/60 p-4 border border-zinc-800/40">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-800 font-bold text-zinc-200 text-lg">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-bold text-base text-zinc-100">
                  {user?.name || "Guest Account"}
                </p>
                {isAuthenticated ? (
                  <span className="inline-flex items-center rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                    Synced
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                    Local
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-zinc-400 truncate">
                {user?.email || "Sign in to enable cloud synchronization"}
              </p>
            </div>
          </div>
        </section>

        {/* Minimalist KPI Dashboard Grid */}
        <section className="grid grid-cols-2 gap-2.5">
          {/* Daily Spent */}
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

          {/* Total Net Worth */}
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

        {/* Color-Differentiated Cash Liquidity Distribution Card */}
        <section className="rounded-2xl bg-zinc-900/60 p-4 border border-zinc-800/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BsWallet2 className="h-4 w-4 text-zinc-400" />
              <h2 className="text-sm font-semibold text-zinc-200">Cash Distribution</h2>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-green-300 bg-green-500/10 px-2 py-0.5 rounded-full">
                {digitalPct}% Digital
              </span>
              <span className="text-[11px] font-bold text-[#ffff64] bg-[#ffff64]/10 px-2 py-0.5 rounded-full">
                {cashPct}% Cash
              </span>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="mt-3.5 h-2.5 flex overflow-hidden rounded-full bg-zinc-950 p-0.5">
            <div
              className="h-full bg-green-400 rounded-l-full transition-all duration-300"
              style={{ width: `${digitalPct}%` }}
              title={`Digital: ${formatCurrency(totalDigital)}`}
            />
            <div
              className="h-full bg-[#ffff64] rounded-r-full transition-all duration-300"
              style={{ width: `${cashPct}%` }}
              title={`Cash: ${formatCurrency(totalCash)}`}
            />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 border-t border-zinc-800/40 pt-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-green-400 shrink-0" />
              <div>
                <p className="text-zinc-400 font-medium">Digital Wallet</p>
                <p className="font-bold tabular-nums text-green-300">{formatCurrency(totalDigital)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-[#ffff64] shrink-0" />
              <div>
                <p className="text-zinc-400 font-medium">Cash on Hand</p>
                <p className="font-bold tabular-nums text-[#ffff64]">{formatCurrency(totalCash)}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Settings Card: Where should overflow go? */}
        <section className="rounded-2xl bg-zinc-900/60 p-4 border border-zinc-800/40 space-y-3">
          <div className="flex items-center gap-2">
            <BsGear className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-zinc-200">Allocation & Overflow Settings</h2>
          </div>

          <div className="space-y-2 pt-1">
            <div>
              <p className="text-xs font-semibold text-zinc-200">Where should overflow go?</p>
              <p className="text-[11px] text-zinc-400">
                Any income exceeding a sub-stash's max cap will automatically deposit to this target stash.
              </p>
            </div>

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

        {/* Minimalist Pay Later Obligations Summary */}
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

        {/* Minimalist Guest Account Action */}
        {!isAuthenticated && (
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-xs font-bold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-[0.99]"
          >
            <BsCheckLg className="h-4 w-4" />
            Sign In to Backup Cloud Stashes
          </button>
        )}
      </div>

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
