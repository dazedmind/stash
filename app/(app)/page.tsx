"use client";

import { useState } from "react";
import Link from "next/link";
import { BsPencil, BsPlusLg } from "react-icons/bs";
import { EditAllocationModal } from "../components/EditAllocationModal";
import { ExpenseSheet } from "../components/ExpenseSheet";
import { IncomeSheet } from "../components/IncomeSheet";
import { StashCard } from "../components/StashCard";
import { SubCategoryDetailModal } from "../components/SubCategoryDetailModal";
import { SubStashTransferSheet } from "../components/SubStashTransferSheet";
import { formatCurrency, type MainCategory } from "../lib/finance";
import { useApp } from "../lib/store";

export default function HomePage() {
  const {
    totalIncomeReceived,
    allocationTotals,
    totalBalance,
    totalDigital,
    totalCash,
    categories,
  } = useApp();

  const [incomeOpen, setIncomeOpen] = useState(false);
  const [editAllocOpen, setEditAllocOpen] = useState(false);
  const [selectedCategoryModal, setSelectedCategoryModal] = useState<MainCategory | null>(null);

  const [transferFromSubId, setTransferFromSubId] = useState<string | null>(null);
  const [expenseFromSubId, setExpenseFromSubId] = useState<string | null>(null);

  return (
    <>
      <div className="animate-fade-in space-y-4 px-4 py-4">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              STASH
            </span>
            <h1 className="text-xl font-bold tracking-tight text-zinc-100">Overview</h1>
          </div>

          {/* Income Positive Green Button */}
          <button
            type="button"
            onClick={() => setIncomeOpen(true)}
            className="flex min-h-[36px] items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 text-xs font-bold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-95 shadow-xs"
          >
            <BsPlusLg className="h-3.5 w-3.5" />
            Income
          </button>
        </header>

        {/* Total Balance Card */}
        <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5">
          <p className="text-xs font-medium text-zinc-400">Total Balance</p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums tracking-tight text-zinc-100">
            {formatCurrency(totalBalance)}
          </p>
          <div className="mt-4 flex gap-6 border-t border-zinc-800/60 pt-3 text-xs">
            <div>
              <p className="text-zinc-500 font-medium">Digital Wallet</p>
              <p className="font-semibold tabular-nums text-zinc-200">{formatCurrency(totalDigital)}</p>
            </div>
            <div>
              <p className="text-zinc-500 font-medium">Cash on Hand</p>
              <p className="font-semibold tabular-nums text-zinc-200">{formatCurrency(totalCash)}</p>
            </div>
          </div>
        </section>

        {/* Auto Allocation */}
        <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-200">Auto Allocation</h2>
            <button
              type="button"
              onClick={() => setEditAllocOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-800 border border-zinc-700/60 px-2.5 py-1 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
            >
              <BsPencil className="h-3 w-3" /> Edit
            </button>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => setSelectedCategoryModal(cat)}
                className="cursor-pointer rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-2.5 transition-colors hover:border-zinc-700"
              >
                <div className="flex items-center justify-between text-[11px] font-medium text-zinc-400">
                  <span>{cat.name}</span>
                  <span>{cat.percentage}%</span>
                </div>
                <p className="mt-1 text-sm font-semibold tabular-nums text-zinc-100">
                  {formatCurrency(allocationTotals[cat.tag])}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Stashes List */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-200">Categories</h2>
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
      </div>

      {/* Modals & Sheets */}
      <IncomeSheet open={incomeOpen} onClose={() => setIncomeOpen(false)} />

      <EditAllocationModal open={editAllocOpen} onClose={() => setEditAllocOpen(false)} />

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
        onClose={() => setTransferFromSubId(null)}
      />

      <ExpenseSheet
        open={!!expenseFromSubId}
        defaultSubCategoryId={expenseFromSubId || undefined}
        onClose={() => setExpenseFromSubId(null)}
      />
    </>
  );
}
