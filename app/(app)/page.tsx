"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BsArrowLeftRight, BsClockHistory, BsDashLg, BsEye, BsEyeSlash, BsPlusLg } from "react-icons/bs";

import { CategoryIcon } from "../components/CategoryIcon";
import { ExpenseRecordCard } from "../components/ExpenseRecordCard";
import { ExpenseSheet } from "../components/ExpenseSheet";
import { IncomeSheet } from "../components/IncomeSheet";
import { StashCard } from "../components/StashCard";
import { SubCategoryDetailModal } from "../components/SubCategoryDetailModal";
import { SubStashTransferSheet } from "../components/SubStashTransferSheet";
import { TransactionHistoryModal } from "../components/TransactionHistoryModal";
import { formatCurrency, getCategoryTotalBalance, type MainCategory } from "../lib/finance";
import { useApp } from "../lib/store";

interface TransactionLog {
  id: string;
  type: "income" | "expense" | "transfer_internal" | "transfer_sub";
  amount: number;
  source: string | null;
  tag?: string | null;
  description: string | null;
  subCategoryName: string | null;
  breakdown: Record<string, number> | null;
  createdAt: string;
}

export default function HomePage() {
  const {
    totalIncomeReceived,
    totalBalance,
    totalDigital,
    totalCash,
    categories,
  } = useApp();

  const [incomeOpen, setIncomeOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedCategoryModal, setSelectedCategoryModal] = useState<MainCategory | null>(null);

  const [transferFromSubId, setTransferFromSubId] = useState<string | null>(null);
  const [expenseFromSubId, setExpenseFromSubId] = useState<string | null>(null);

  const [recentTransactions, setRecentTransactions] = useState<TransactionLog[]>([]);
  const [totalHidden, setTotalHidden] = useState(false);

  const fetchRecentTransactions = useCallback(() => {
    fetch("/api/finance/transactions")
      .then((res) => res.json())
      .then((data) => {
        if (data.transactions) {
          setRecentTransactions(data.transactions.slice(0, 4));
        }
      })
      .catch((err) => console.error("Recent tx error:", err));
  }, []);

  useEffect(() => {
    fetchRecentTransactions();
  }, [fetchRecentTransactions, totalBalance, totalIncomeReceived]);

  const homescreenCategories = categories.filter((cat) => cat.showInHomescreen !== false);

  return (
    <>
      <div className="animate-fade-in space-y-5 px-4 py-4">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="stash-logo.png" className="w-6" alt="Stash Logo" />

            <span className="-space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">STASH</p>
              <h1 className="text-xl font-bold tracking-tight text-zinc-100">Overview</h1>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setHistoryOpen(true)}
              className="flex min-h-[36px] items-center gap-1.5 rounded-xl bg-zinc-900 px-3 text-xs font-semibold text-zinc-300 transition-all hover:bg-zinc-800 hover:text-white active:scale-95"
            >
              <BsClockHistory className="h-3.5 w-3.5 text-emerald-400" />
              History
            </button>

            {/* <button
              type="button"
              onClick={() => setIncomeOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-emerald-500 p-3 text-xs font-bold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-95 shadow-xs"
            >
              <BsPlusLg className="h-4 w-4" strokeWidth={1.5} />
            </button> */}
          </div>
        </header>

        {/* Total Balance Card - Premium Silver Metallic Finish */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-300/20 via-zinc-800/90 to-zinc-950 p-5 border border-slate-300/30 shadow-xl shadow-black/50 backdrop-blur-md">
          {/* Metallic Ambient Light Overlays */}
          <div className="pointer-events-none absolute -top-12 -left-12 h-32 w-32 rounded-full bg-slate-200/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-slate-400/10 blur-2xl" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-60" />

          <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">Total Balance</p>

          <span className="mt-2 flex items-center gap-3 relative z-10">
            <p className="text-3xl font-extrabold tabular-nums tracking-tight text-white drop-shadow-sm">
              {!totalHidden ? `${formatCurrency(totalBalance)}` : "******"}
            </p>

            {!totalHidden ? (
              <button type="button" onClick={() => setTotalHidden(true)}>
                <BsEye className="h-4 w-4 text-slate-300 hover:text-white transition-colors" />
              </button>
            ) : (
              <button type="button" onClick={() => setTotalHidden(false)}>
                <BsEyeSlash className="h-4 w-4 text-slate-300 hover:text-white transition-colors" />
              </button>
            )}
          </span>

          <div className="mt-4 flex gap-6 border-t border-slate-400/20 pt-3 text-xs relative z-10">
            <div>
              <p className="text-slate-400 font-medium">Digital Wallet</p>
              <p className="font-semibold tabular-nums text-slate-100">
                {!totalHidden ? `${formatCurrency(totalDigital)}` : "******"}
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Cash on Hand</p>
              <p className="font-semibold tabular-nums text-slate-100">
                {!totalHidden ? `${formatCurrency(totalCash)}` : "******"}
              </p>
            </div>
          </div>
        </section>

        {/* Budget Categories Bar */}
        <section className="">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-zinc-200">Budget Categories</h2>
            {homescreenCategories.length > 3 && (
              <span className="text-xs font-bold text-black bg-emerald-400 px-2 rounded-full">{homescreenCategories.length}</span>
            )}
          </div>

          <div className="mt-3 flex overflow-x-auto gap-2.5 snap-x snap-mandatory scrollbar-none pb-1">
            {homescreenCategories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => setSelectedCategoryModal(cat)}
                className="snap-start shrink-0 w-[calc(33.333%-0.45rem)] cursor-pointer rounded-xl bg-zinc-900/60 p-2 transition-colors hover:bg-zinc-900 flex items-center gap-2"
              >
                <div className="flex flex-col justify-center text-center items-center gap-2 w-full p-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center text-emerald-400 font-bold">
                    <CategoryIcon iconName={cat.icon} className="h-5 w-5" />
                  </div>
                  <span className="flex flex-col space-y-0.5 w-full">
                    <div className="text-xs font-medium text-zinc-400">
                      <span className="truncate block max-w-full">{cat.name}</span>
                    </div>
                    <p className="text-sm font-bold tabular-nums text-zinc-100 truncate">
                      {!totalHidden ? `${formatCurrency(getCategoryTotalBalance(cat))}` : "******"}
                    </p>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Stashes List */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-200">Categories & Stashes</h2>
            <Link href="/stashes" className="text-xs font-medium text-zinc-400 hover:text-zinc-200">
              See all
            </Link>
          </div>
          <div className="space-y-3">
            {homescreenCategories.map((cat) => (
              <StashCard
                key={cat.id}
                category={cat}
                compact
                onClickCard={() => setSelectedCategoryModal(cat)}
                onTransfer={() => setSelectedCategoryModal(cat)}
                totalHidden={totalHidden}
              />
            ))}
          </div>
        </section>

        {/* Recent Transaction History */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              {/* <BsClockHistory className="h-4 w-4 text-emerald-400" /> */}
              <h2 className="text-sm font-semibold text-zinc-200">Recent Transactions</h2>
            </div>
            <div className="flex items-center gap-2.5">
              <Link
                href="/expenses"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                See all expense
              </Link>
              <span className="text-zinc-700 text-xs">•</span>
              <button
                type="button"
                onClick={() => setHistoryOpen(true)}
                className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                See all
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {recentTransactions.length === 0 ? (
              <div className="rounded-2xl bg-zinc-900/40 p-6 text-center border border-zinc-800/30">
                <p className="text-xs text-zinc-500">No recent transactions</p>
              </div>
            ) : (
              recentTransactions.map((tx) => (
                <ExpenseRecordCard
                  key={tx.id}
                  transaction={tx}
                  onClick={() => setHistoryOpen(true)}
                  showDate={true}
                />
              ))
            )}
          </div>
        </section>
      </div>

      {/* Modals & Sheets */}
      <IncomeSheet
        open={incomeOpen}
        onClose={() => {
          setIncomeOpen(false);
          fetchRecentTransactions();
        }}
      />

      <TransactionHistoryModal open={historyOpen} onClose={() => setHistoryOpen(false)} />

      <SubCategoryDetailModal
        category={selectedCategoryModal}
        open={!!selectedCategoryModal}
        onClose={() => setSelectedCategoryModal(null)}
        onTransferSub={(sub) => setTransferFromSubId(sub.id)}
        onExpenseSub={(sub) => setExpenseFromSubId(sub.id)}
      />

      <SubStashTransferSheet
        open={!!transferFromSubId}
        initialFromSubId={transferFromSubId || undefined}
        onClose={() => {
          setTransferFromSubId(null);
          fetchRecentTransactions();
        }}
      />

      <ExpenseSheet
        open={!!expenseFromSubId}
        defaultSubCategoryId={expenseFromSubId || undefined}
        onClose={() => {
          setExpenseFromSubId(null);
          fetchRecentTransactions();
        }}
      />
    </>
  );
}
