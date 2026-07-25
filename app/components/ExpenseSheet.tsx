"use client";

import { useEffect, useState } from "react";
import { BsCash, BsDashLg, BsJournalText, BsCreditCard } from "react-icons/bs";
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
  const [note, setNote] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount("");
      setNote("");
      setSource("digital");
      const defaultId = defaultSubCategoryId || (allSubcategories.length > 0 ? allSubcategories[0].id : "");
      setSubCategoryId(defaultId);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [open, defaultSubCategoryId, allSubcategories]);

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
  const isValid = parsedAmount > 0 && parsedAmount <= availableBalance && !!subCategoryId;

  function handleSubmit() {
    if (!isValid || !subCategoryId) return;
    addExpenseAmount(subCategoryId, parsedAmount, source, note);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center" role="dialog" aria-modal="true">
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
        style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="mx-auto mb-4 h-1 w-8 rounded-full bg-zinc-800" />

        <div className="flex items-center gap-2 text-rose-400">
          <h2 className="text-xl font-semibold text-zinc-100">Deduct Expense</h2>
        </div>

        <div className="mt-4 space-y-3.5">
          {/* Custom Stash Select Card with Category Icons */}
          <StashSelectCard
            label="Subtract From Stash"
            selectedSubId={subCategoryId}
            categories={categories}
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
                  <BsCreditCard className="w-4 h-4"/>
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
                  <BsCash className="w-4 h-4"/>
                  Cash ({formatCurrency(selectedSub?.cash || 0)})
                </span>
              </button>
            </div>
          </div>

          {/* Expense Amount Input */}
          <label className="block">
            <span className="text-xs text-zinc-400 font-medium">Expense Amount</span>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-zinc-500">
                ₱
              </span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                className="min-h-[52px] w-full rounded-xl bg-zinc-900 pl-10 pr-4 text-2xl font-bold tabular-nums text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            {parsedAmount > availableBalance && (
              <p className="mt-1 text-xs font-medium text-rose-400">
                Insufficient stash balance ({formatCurrency(availableBalance)})
              </p>
            )}
          </label>

          {/* Note Input Field */}
          <div>
            <span className="text-xs text-zinc-400 font-medium">Note (optional)</span>
            <div className="relative mt-1.5">
              <BsJournalText className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="e.g. Groceries at SM, Dinner with friends"
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
          <BsDashLg className="h-4 w-4" />
          Subtract Expense
        </button>
      </div>
    </div>
  );
}
