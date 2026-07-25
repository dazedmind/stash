"use client";

import { useEffect, useState } from "react";
import { BsDashLg, BsPlusLg } from "react-icons/bs";

interface ActionChoiceSheetProps {
  open: boolean;
  onClose: () => void;
  onSelectIncome: () => void;
  onSelectExpense: () => void;
}

export function ActionChoiceSheet({
  open,
  onClose,
  onSelectIncome,
  onSelectExpense,
}: ActionChoiceSheetProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [open]);

  if (!open) return null;

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

        <h2 className="text-center text-base font-semibold text-zinc-100">Add Transaction</h2>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {/* Income - Positive Green */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectIncome();
            }}
            className="flex flex-col items-center justify-center gap-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-400 transition-all active:scale-95 hover:border-emerald-500/40 hover:bg-emerald-500/20"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-zinc-950">
              <BsPlusLg className="h-5 w-5" strokeWidth={1.5}/>
            </div>
            <span className="text-sm font-semibold">Income</span>
          </button>

          {/* Expense - Danger Red */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectExpense();
            }}
            className="flex flex-col items-center justify-center gap-2.5 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-red-400 transition-all active:scale-95 hover:border-rose-500/40 hover:bg-rose-500/20"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500 text-zinc-950">
              <BsDashLg className="h-5 w-5" strokeWidth={1.5}/>
            </div>
            <span className="text-sm font-semibold">Expense</span>
          </button>
        </div>
      </div>
    </div>
  );
}
