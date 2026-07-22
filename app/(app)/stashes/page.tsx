"use client";

import { useState } from "react";
import { ExpenseSheet } from "../../components/ExpenseSheet";
import { StashCard } from "../../components/StashCard";
import { SubCategoryDetailModal } from "../../components/SubCategoryDetailModal";
import { SubStashTransferSheet } from "../../components/SubStashTransferSheet";
import { formatCurrency, type MainCategory, type CategoryTag } from "../../lib/finance";
import { useApp } from "../../lib/store";

const filters: Array<CategoryTag | "All"> = ["All", "Savings", "Liabilities", "Expenses"];

export default function StashesPage() {
  const { categories, totalDigital, totalCash } = useApp();
  const [filter, setFilter] = useState<CategoryTag | "All">("All");

  const [selectedCategoryModal, setSelectedCategoryModal] = useState<MainCategory | null>(null);
  const [transferFromSubId, setTransferFromSubId] = useState<string | null>(null);
  const [expenseFromSubId, setExpenseFromSubId] = useState<string | null>(null);

  const filtered =
    filter === "All" ? categories : categories.filter((c) => c.tag === filter);

  return (
    <>
      <div className="animate-fade-in space-y-4 px-4 py-4">
        <header>
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            STASHES
          </span>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">Category Stashes</h1>
        </header>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-3">
            <p className="text-xs text-zinc-500 font-medium">Total Digital</p>
            <p className="mt-1 text-base font-semibold tabular-nums text-zinc-100">
              {formatCurrency(totalDigital)}
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-3">
            <p className="text-xs text-zinc-500 font-medium">Total Cash</p>
            <p className="mt-1 text-base font-semibold tabular-nums text-zinc-100">
              {formatCurrency(totalCash)}
            </p>
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`shrink-0 min-h-[36px] rounded-xl px-3.5 text-xs font-medium transition-colors ${
                filter === item
                  ? "border border-zinc-700 bg-zinc-800 text-zinc-100 font-semibold"
                  : "bg-zinc-900/60 text-zinc-400 border border-zinc-800/60 hover:text-zinc-200"
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
