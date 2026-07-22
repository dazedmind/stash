"use client";

import { useEffect, useState } from "react";
import { BsPlusLg } from "react-icons/bs";
import { formatCurrency } from "../lib/finance";
import { useApp } from "../lib/store";

interface IncomeSheetProps {
  open: boolean;
  onClose: () => void;
}

export function IncomeSheet({ open, onClose }: IncomeSheetProps) {
  const { addIncomeAmount, monthlyIncome, categories } = useApp();
  const [amount, setAmount] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount(String(monthlyIncome));
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [open, monthlyIncome]);

  if (!open) return null;

  const parsedAmount = Number.parseInt(amount.replace(/\D/g, ""), 10) || 0;
  const isValid = parsedAmount > 0;

  function handleSubmit() {
    if (!isValid) return;
    addIncomeAmount(parsedAmount);
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

        <div className="flex items-center gap-2 text-emerald-400">
          <BsPlusLg className="h-4 w-4" />
          <h2 className="text-base font-semibold text-zinc-100">Add Income</h2>
        </div>

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
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
              className="min-h-[52px] w-full rounded-xl border border-zinc-800 bg-zinc-900 pl-10 pr-4 text-2xl font-bold tabular-nums text-zinc-100 outline-none focus:border-zinc-700"
            />
          </div>
        </label>

        <div className="mt-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3">
          <span className="text-xs font-medium text-zinc-400">Allocation Breakdown</span>
          <div className="mt-2 space-y-1.5 text-xs">
            {categories.map((cat) => {
              const allocatedShare = Math.round(parsedAmount * (cat.percentage / 100));

              return (
                <div key={cat.id} className="flex justify-between items-center text-zinc-300">
                  <span>
                    {cat.name} ({cat.percentage}%)
                  </span>
                  <span className="tabular-nums font-mono text-zinc-200">
                    {formatCurrency(allocatedShare)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Positive Button - Green */}
        <button
          type="button"
          disabled={!isValid}
          onClick={handleSubmit}
          className="mt-5 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-sm font-bold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-[0.99] disabled:opacity-30"
        >
          <BsPlusLg className="h-4 w-4" />
          Add Income
        </button>
      </div>
    </div>
  );
}
