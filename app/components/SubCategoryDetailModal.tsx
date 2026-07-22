"use client";

import { useEffect, useState } from "react";
import { BsArrowLeftRight, BsDashLg, BsX } from "react-icons/bs";
import { formatCurrency, getCategoryTotalBalance, type MainCategory, type SubCategory } from "../lib/finance";

interface SubCategoryDetailModalProps {
  category: MainCategory | null;
  open: boolean;
  onClose: () => void;
  onTransferSub: (sub: SubCategory) => void;
  onExpenseSub: (sub: SubCategory) => void;
}

export function SubCategoryDetailModal({
  category,
  open,
  onClose,
  onTransferSub,
  onExpenseSub,
}: SubCategoryDetailModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [open]);

  if (!open || !category) return null;

  const totalCatBalance = getCategoryTotalBalance(category);

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
        className={`relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-t-3xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl transition-transform duration-200 ease-out ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="mx-auto mb-4 h-1 w-8 rounded-full bg-zinc-800" />

        <header className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-100">{category.name} Stashes</h2>
            <p className="mt-0.5 text-xs text-zinc-400 font-medium">
              {category.percentage}% Allocation • {formatCurrency(totalCatBalance)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 hover:text-zinc-100"
          >
            <BsX className="h-5 w-5" />
          </button>
        </header>

        <div className="mt-4 space-y-3">
          {category.subcategories.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800/60 p-6 text-center text-xs text-zinc-500">
              No sub-stashes created yet.
            </div>
          ) : (
            category.subcategories.map((sub) => {
              const subTotal = sub.digital + sub.cash;

              return (
                <div
                  key={sub.id}
                  className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 transition-all hover:border-zinc-700"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-base text-zinc-100">{sub.name}</h3>
                    <p className="text-lg font-bold tabular-nums text-zinc-100">
                      {formatCurrency(subTotal)}
                    </p>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between border-t border-zinc-800/60 pt-2.5 text-xs text-zinc-400">
                    <span>Digital {formatCurrency(sub.digital)}</span>
                    <span>Cash {formatCurrency(sub.cash)}</span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {/* Transfer Button - Neutral with subtle icon */}
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onTransferSub(sub);
                      }}
                      className="flex min-h-[38px] items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 text-xs font-semibold text-zinc-200 transition-all hover:bg-zinc-800 active:scale-95"
                    >
                      <BsArrowLeftRight className="h-3.5 w-3.5 text-emerald-400" />
                      Transfer
                    </button>

                    {/* Subtract Expense Button - Red Danger */}
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onExpenseSub(sub);
                      }}
                      className="flex min-h-[38px] items-center justify-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-xs font-semibold text-rose-400 transition-all hover:bg-rose-500/20 active:scale-95"
                    >
                      <BsDashLg className="h-3.5 w-3.5" />
                      Subtract Expense
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
