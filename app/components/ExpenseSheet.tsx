"use client";

import { useEffect, useState } from "react";
import { BsCash, BsDashLg, BsWallet } from "react-icons/bs";
import { formatCurrency } from "../lib/finance";
import { useApp } from "../lib/store";

interface ExpenseSheetProps {
  open: boolean;
  onClose: () => void;
  defaultSubCategoryId?: string;
}

export function ExpenseSheet({ open, onClose, defaultSubCategoryId }: ExpenseSheetProps) {
  const { categories, addExpenseAmount, allSubcategories } = useApp();
  const [amount, setAmount] = useState("");
  const [selectedSubId, setSelectedSubId] = useState<string>("");
  const [source, setSource] = useState<"digital" | "cash">("digital");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount("");
      setSource("digital");
      if (defaultSubCategoryId) {
        setSelectedSubId(defaultSubCategoryId);
      } else if (allSubcategories.length > 0) {
        setSelectedSubId(allSubcategories[0].id);
      }
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [open, defaultSubCategoryId, allSubcategories]);

  if (!open) return null;

  const selectedSub = allSubcategories.find((s) => s.id === selectedSubId);
  const parsedAmount = Number.parseInt(amount.replace(/\D/g, ""), 10) || 0;
  const availableBalance = selectedSub ? (source === "digital" ? selectedSub.digital : selectedSub.cash) : 0;
  const isValid = parsedAmount > 0 && selectedSub && parsedAmount <= availableBalance;

  function handleSubmit() {
    if (!isValid || !selectedSubId) return;
    addExpenseAmount(selectedSubId, parsedAmount, source);
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
        className={`relative w-full max-w-lg rounded-t-3xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl transition-transform duration-200 ease-out ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="mx-auto mb-4 h-1 w-8 rounded-full bg-zinc-800" />

        <div className="flex items-center gap-2 text-rose-400">
          <BsDashLg className="h-4 w-4" />
          <h2 className="text-base font-semibold text-zinc-100">Subtract Expense</h2>
        </div>

        {/* Sub-stash Selector */}
        <label className="mt-4 block">
          <span className="text-xs text-zinc-400 font-medium">Category & Stash</span>
          <select
            value={selectedSubId}
            onChange={(e) => setSelectedSubId(e.target.value)}
            className="mt-1.5 min-h-[44px] w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
          >
            {categories.map((cat) => (
              <optgroup key={cat.id} label={cat.name}>
                {cat.subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {cat.name} → {sub.name} ({formatCurrency(source === "digital" ? sub.digital : sub.cash)})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        {/* Source Toggle */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSource("digital")}
            className={`min-h-[40px] rounded-xl border text-xs font-medium transition-colors ${
              source === "digital"
                ? "border-zinc-700 bg-zinc-800 text-zinc-100 font-semibold"
                : "border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
            }`}
          >
              <span className="flex justify-center items-center gap-2">
                <BsWallet />
                Digital Wallet
              </span>
          </button>
          <button
            type="button"
            onClick={() => setSource("cash")}
            className={`min-h-[40px] rounded-xl border text-xs font-medium transition-colors ${
              source === "cash"
                ? "border-zinc-700 bg-zinc-800 text-zinc-100 font-semibold"
                : "border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span className="flex justify-center items-center gap-2">
              <BsCash />
              Cash on Hand
            </span>
          </button>
        </div>

        {/* Amount Input */}
        <label className="mt-4 block">
          <span className="text-xs text-zinc-400 font-medium">Amount</span>
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
              className="min-h-[52px] w-full rounded-xl border border-zinc-800 bg-zinc-900 pl-10 pr-4 text-2xl font-bold tabular-nums text-zinc-100 outline-none focus:border-zinc-700"
            />
          </div>
          {parsedAmount > availableBalance && (
            <p className="mt-1 text-xs font-medium text-rose-400">
              Available: {formatCurrency(availableBalance)}
            </p>
          )}
        </label>

        {/* Presets */}
        <div className="mt-3 grid grid-cols-4 gap-2">
          {[100, 200, 500, 1000].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(String(preset))}
              className="min-h-[38px] rounded-xl border border-zinc-800 bg-zinc-900 text-xs text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              ₱{preset.toLocaleString()}
            </button>
          ))}
        </div>

        {/* Danger Button - Red */}
        <button
          type="button"
          disabled={!isValid}
          onClick={handleSubmit}
          className="mt-5 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-rose-500 text-sm font-bold text-white transition-all hover:bg-rose-400 active:scale-[0.99] disabled:opacity-30"
        >
          <BsDashLg className="h-4 w-4" />
          Confirm Expense
        </button>
      </div>
    </div>
  );
}
