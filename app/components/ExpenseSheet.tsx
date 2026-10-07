"use client";

import { useEffect, useState } from "react";
import {
  BsCash,
  BsCreditCard,
  BsJournalText,
  BsTag,
} from "react-icons/bs";
import { EXPENSE_TAGS } from "../lib/expenseTags";
import { formatCurrency, type SubCategory } from "../lib/finance";
import { useApp } from "../lib/store";
import { StashSelectCard } from "./StashSelectCard";

interface ExpenseSheetProps {
  open: boolean;
  onClose: () => void;
  defaultSubCategoryId?: string;
}

export function ExpenseSheet({
  open,
  onClose,
  defaultSubCategoryId,
}: ExpenseSheetProps) {
  const { categories, allSubcategories, addExpenseAmount } = useApp();
  const [subCategoryId, setSubCategoryId] = useState<string>("");
  const [source, setSource] = useState<"digital" | "cash">("digital");
  const [amount, setAmount] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("food");
  const [note, setNote] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount("");
      setNote("");
      setSelectedTag("food");
      setSource("digital");
      const nonSafeSubcategories = allSubcategories.filter((sub) => {
        const cat = categories.find((c) => c.id === sub.categoryId);
        return cat ? !cat.isSafe : true;
      });
      const defaultId =
        defaultSubCategoryId ||
        (nonSafeSubcategories.length > 0 ? nonSafeSubcategories[0].id : "");
      setSubCategoryId(defaultId);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [open, defaultSubCategoryId, allSubcategories, categories]);

  if (!open) return null;

  const selectedSub: SubCategory | undefined = allSubcategories.find(
    (s) => s.id === subCategoryId
  );

  const availableBalance = selectedSub
    ? source === "digital"
      ? selectedSub.digital
      : selectedSub.cash
    : 0;

  const parsedAmount = Number.parseInt(amount.replace(/\D/g, ""), 10) || 0;
  const isValid =
    parsedAmount > 0 && parsedAmount <= availableBalance && !!subCategoryId;

  function handleSubmit() {
    if (!isValid || !subCategoryId) return;
    addExpenseAmount(subCategoryId, parsedAmount, source, note, selectedTag);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Close"
        className={`absolute inset-0 bg-black/70 transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-lg rounded-t-3xl bg-zinc-950 p-5 shadow-2xl transition-transform duration-200 ease-out ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {/* Drag handle */}
        <div className="mx-auto mb-4 h-1 w-8 rounded-full bg-zinc-800" />

        {/* Old Header */}
        <div className="flex items-center gap-2 text-rose-400">
          <h2 className="text-xl font-semibold text-zinc-100">Deduct Expense</h2>
        </div>

        <div className="mt-4 space-y-3.5">
          {/* Custom Stash Select Card with Category Icons */}
          <StashSelectCard
            label="Subtract From Stash"
            selectedSubId={subCategoryId}
            categories={categories.filter((cat) => !cat.isSafe)}
            onSelect={(newSub) => setSubCategoryId(newSub)}
          />

          {/* Wallet Source Selector */}
          <div>
            <span className="text-xs text-zinc-400 font-medium">Payment Source</span>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSource("digital")}
                className={`min-h-[40px] rounded-xl text-xs font-medium transition-colors ${
                  source === "digital"
                    ? "bg-zinc-800 text-zinc-100 font-semibold border border-zinc-700"
                    : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <span className="flex items-center justify-center gap-1">
                  <BsCreditCard className="w-4 h-4" />
                  Digital ({formatCurrency(selectedSub?.digital || 0)})
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSource("cash")}
                className={`min-h-[40px] rounded-xl text-xs font-medium transition-colors ${
                  source === "cash"
                    ? "bg-zinc-800 text-zinc-100 font-semibold border border-zinc-700"
                    : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <span className="flex items-center justify-center gap-1">
                  <BsCash className="w-4 h-4" />
                  Cash ({formatCurrency(selectedSub?.cash || 0)})
                </span>
              </button>
            </div>
          </div>
          
          {/* Expense Amount Input: simple bold large numbers, no preset amount tags */}
          <label className="block text-center">
            <span className="text-xs text-zinc-400 font-medium">Expense Amount</span>
            <div className="relative mt-2 transition-transform duration-300 focus-within:scale-[1.02]">
              <span className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-bold text-zinc-500">
                ₱
              </span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="0"
                value={amount ? Number(amount).toLocaleString("en-US") : ""}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                style={{ fontSize: "2rem", fontWeight: 800 }}
                className="w-full rounded-2xl bg-zinc-900 py-2 px-14 text-center tabular-nums text-rose-400 outline-none transition-colors focus:bg-zinc-800/80 focus:ring-2 focus:ring-rose-500/30"
              />
            </div>
            {parsedAmount > availableBalance && (
              <p className="mt-2 text-xs font-medium text-rose-400">
                Insufficient stash balance ({formatCurrency(availableBalance)})
              </p>
            )}
          </label>

          {/* Tag Selector: single row, horizontally scrollable without visible scrollbar, neutral non-color-coded styling */}
          <div>
            <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
              <BsTag className="h-3 w-3 text-zinc-400" /> Expense Tag
            </span>
            <div className="mt-1.5 flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5">
              {EXPENSE_TAGS.map((tag) => {
                const Icon = tag.icon;
                const isSelected = selectedTag === tag.id;
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => setSelectedTag(tag.id)}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs transition-colors whitespace-nowrap ${
                      isSelected
                        ? "bg-zinc-800 text-zinc-100 font-semibold border border-zinc-600"
                        : "bg-zinc-900/80 border border-zinc-800/80 text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                    <span>{tag.label}</span>
                  </button>
                );
              })}
            </div>
          </div>


          {/* Note Input Field */}
          <div>
            <span className="text-xs text-zinc-400 font-medium">Note (optional)</span>
            <div className="relative mt-1.5">
              <BsJournalText className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="e.g. Groceries, Lunch"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="min-h-[44px] w-full rounded-xl bg-zinc-900 pl-10 pr-3 text-xs text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Action Button - Red */}
        <button
          type="button"
          disabled={!isValid}
          onClick={handleSubmit}
          className="mt-5 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-rose-500 text-sm font-bold text-zinc-950 transition-all hover:bg-rose-400 active:scale-[0.99] disabled:opacity-30"
        >
          Subtract Expense
        </button>
      </div>
    </div>
  );
}
