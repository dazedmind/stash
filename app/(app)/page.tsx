"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BsArrowLeftRight, BsClockHistory, BsDashLg, BsEye, BsEyeSlash, BsPlusLg } from "react-icons/bs";

import { CategoryIcon } from "../components/CategoryIcon";
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

  return (
    <>
      <div className="animate-fade-in space-y-5 px-4 py-4">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              STASH
            </span>
            <h1 className="text-xl font-bold tracking-tight text-zinc-100">Overview</h1>
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

            <button
              type="button"
              onClick={() => setIncomeOpen(true)}
              className="flex min-h-[36px] items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 text-xs font-bold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-95 shadow-xs"
            >
              <BsPlusLg className="h-3.5 w-3.5" />
              Income
            </button>
          </div>
        </header>

        {/* Total Balance Card - Clean Fill, No Vibe-Coded Heavy Border */}
        <section className="rounded-2xl bg-zinc-900/60 p-5">
          <p className="text-xs font-medium text-zinc-400">Total Balance</p>
        
            <span className="mt-2 flex items-center gap-3">
              <p className="text-3xl font-extrabold tabular-nums tracking-tight text-zinc-100">
                {!totalHidden ? `${formatCurrency(totalBalance)}` : '●●●●●●'}
              </p>
            
                {!totalHidden ? (
                  <button onClick={() => setTotalHidden(true)}>
                    <BsEye className="h-4 w-4"/>
                  </button>

                ):(
                  <button onClick={() => setTotalHidden(false)}>
                    <BsEyeSlash className="h-4 w-4"/>
                  </button>
                )}
            </span>
          <div className="mt-4 flex gap-6 border-t border-zinc-800/40 pt-3 text-xs">
            <div>
              <p className="text-zinc-500 font-medium">Digital Wallet</p>
              <p className="font-semibold tabular-nums text-zinc-200">
                {!totalHidden ? `${formatCurrency(totalDigital)}` : '●●●●●'}
              </p>
            </div>
            <div>
              <p className="text-zinc-500 font-medium">Cash on Hand</p>
              <p className="font-semibold tabular-nums text-zinc-200">
                {!totalHidden ? `${formatCurrency(totalCash)}` : '●●●●●'}
              </p>
            </div>
          </div>
        </section>

        {/* Budget Categories with Circular Icon on the Right Side */}
        <section className="rounded-2xl bg-zinc-900/60 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-200">Budget Categories</h2>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 sm:grid-cols-3 gap-2.5">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => setSelectedCategoryModal(cat)}
                className="cursor-pointer rounded-xl bg-zinc-950/70 p-2 transition-colors hover:bg-zinc-950 flex items-center gap-2 w-full"
              >
                <div className="flex flex-col justify-center text-center items-center gap-2 w-full p-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-emerald-400 font-bold">
                    <CategoryIcon iconName={cat.icon} className="h-4 w-4" />
                  </div>
                  <span className="flex flex-col space-y-0.5">
                    <div className="text-xs font-medium text-zinc-400">
                      <span className="truncate">{cat.name}</span>
                    </div>
                    <p className="text-base font-bold tabular-nums text-zinc-100">
                      {!totalHidden ? `${formatCurrency(getCategoryTotalBalance(cat))}` : '●●●●●'}
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
            {categories.map((cat) => (
              <StashCard
                key={cat.id}
                category={cat}
                compact
                onClickCard={() => setSelectedCategoryModal(cat)}
                onTransfer={() => setSelectedCategoryModal(cat)}
              />
            ))}
          </div>
        </section>

        {/* Recent Transaction History Section below Stash cards */}
        <section className="rounded-2xl bg-zinc-900/60 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BsClockHistory className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-zinc-200">Recent Activity</h2>
            </div>
            <button
              type="button"
              onClick={() => setHistoryOpen(true)}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              See all
            </button>
          </div>

          <div className="mt-3 space-y-2.5">
            {recentTransactions.length === 0 ? (
              <p className="py-3 text-center text-xs text-zinc-500">No recent transactions</p>
            ) : (
              recentTransactions.map((tx) => {
                const isIncome = tx.type === "income";
                const isExpense = tx.type === "expense";
                const dateStr = new Date(tx.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={tx.id}
                    onClick={() => setHistoryOpen(true)}
                    className="cursor-pointer rounded-xl bg-zinc-950/70 p-3 transition-colors hover:bg-zinc-950"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                            isIncome
                              ? "bg-emerald-500/10 text-emerald-400"
                              : isExpense
                                ? "bg-rose-500/10 text-rose-400"
                                : "bg-zinc-800 text-zinc-300"
                          }`}
                        >
                          {isIncome ? (
                            <BsPlusLg className="h-3.5 w-3.5" />
                          ) : isExpense ? (
                            <BsDashLg className="h-3.5 w-3.5" />
                          ) : (
                            <BsArrowLeftRight className="h-3.5 w-3.5" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-zinc-100">
                            {isIncome
                              ? "Income Deposit"
                              : isExpense
                                ? `Expense: ${tx.subCategoryName || "Stash"}`
                                : `Transfer: ${tx.description || "Stash Transfer"}`}
                          </p>
                          <p className="text-[10px] text-zinc-400">{dateStr}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p
                          className={`text-xs font-bold tabular-nums ${
                            isIncome
                              ? "text-emerald-400"
                              : isExpense
                                ? "text-rose-400"
                                : "text-zinc-200"
                          }`}
                        >
                          {isIncome ? "+" : isExpense ? "-" : ""}
                          {formatCurrency(tx.amount)}
                        </p>
                      </div>
                    </div>

                    {isIncome && tx.breakdown && Object.keys(tx.breakdown).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1 border-t border-zinc-800/40 pt-2">
                        {Object.entries(tx.breakdown).map(([catName, allocatedAmt]) => (
                          <span
                            key={catName}
                            className="inline-flex items-center gap-1 rounded-md bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-300"
                          >
                            <span className="font-medium text-zinc-400">{catName}:</span>
                            <span className="font-mono text-emerald-400">
                              +{formatCurrency(allocatedAmt)}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
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
