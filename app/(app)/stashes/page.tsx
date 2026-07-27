"use client";

import { useState } from "react";
import Link from "next/link";
import { BsPencil } from "react-icons/bs";
import { ExpenseSheet } from "../../components/ExpenseSheet";
import { StashCard } from "../../components/StashCard";
import { SubCategoryDetailModal } from "../../components/SubCategoryDetailModal";
import { SubStashTransferSheet } from "../../components/SubStashTransferSheet";
import { TransactionHistoryModal } from "../../components/TransactionHistoryModal";
import { formatCurrency, type MainCategory } from "../../lib/finance";
import { useApp } from "../../lib/store";

export default function StashesPage() {
  const { categories, totalDigital, totalCash } = useApp();
  const [filter, setFilter] = useState<string>("All");
  const [historyOpen, setHistoryOpen] = useState(false);

  const [selectedCategoryModal, setSelectedCategoryModal] = useState<MainCategory | null>(null);
  const [transferFromSubId, setTransferFromSubId] = useState<string | null>(null);
  const [expenseFromSubId, setExpenseFromSubId] = useState<string | null>(null);

  const filterOptions = ["All", ...categories.map((c) => c.name)];

  const filtered =
    filter === "All" ? categories : categories.filter((c) => c.name === filter);

  return (
    <>
      <div className="animate-fade-in space-y-4 px-4 py-4">
        <header className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              STASHES
            </span>
            <h1 className="text-xl font-bold tracking-tight text-zinc-100">Category Stashes</h1>
          </div>

          <Link
            href="/stashes/manage"
            className="flex items-center gap-1.5 rounded-lg bg-zinc-800/80 px-2.5 py-1 text-xs font-medium text-emerald-400 transition-colors hover:bg-zinc-700"
          >
            <BsPencil className="h-3 w-3" /> Manage
          </Link>
        </header>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-zinc-900/60 p-3.5">
            <p className="text-xs text-zinc-500 font-medium">Total Digital</p>
            <p className="mt-1 text-base font-semibold tabular-nums text-zinc-100">
              {formatCurrency(totalDigital)}
            </p>
          </div>
          <div className="rounded-2xl bg-zinc-900/60 p-3.5">
            <p className="text-xs text-zinc-500 font-medium">Total Cash</p>
            <p className="mt-1 text-base font-semibold tabular-nums text-zinc-100">
              {formatCurrency(totalCash)}
            </p>
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {filterOptions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`shrink-0 min-h-[36px] rounded-xl px-3.5 text-xs font-medium transition-colors ${
                filter === item
                  ? "bg-emerald-500/10 text-emerald-400 font-semibold"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((cat) => (
            <StashCard
              key={cat.id}
              category={cat}
              onClickCard={() => setSelectedCategoryModal(cat)}
              onTransfer={() => setSelectedCategoryModal(cat)}
            />
          ))}
        </div>
      </div>

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
