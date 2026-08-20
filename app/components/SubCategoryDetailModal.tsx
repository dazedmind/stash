"use client";

import { useEffect, useState } from "react";
import { BsArrowLeftRight, BsDashLg, BsPencil, BsShieldCheck, BsX } from "react-icons/bs";
import { formatCurrency, getCategoryTotalBalance, type MainCategory, type SubCategory } from "../lib/finance";
import { useApp } from "../lib/store";
import { CATEGORY_ICON_OPTIONS, CategoryIcon } from "./CategoryIcon";

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
  const { categories } = useApp();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [open]);

  if (!open || !category) return null;

  // Resolve live category from store so UI state updates immediately upon toggle
  const liveCategory = categories.find((c) => c.id === category.id) || category;
  const totalCatBalance = getCategoryTotalBalance(liveCategory);

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
        className={`relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-t-3xl bg-zinc-950 p-5 shadow-2xl transition-transform duration-200 ease-out ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="mx-auto mb-4 h-1 w-8 rounded-full bg-zinc-800" />

        <header className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-zinc-100">{liveCategory.name} Stash</h2>
            </div>
            <p className="mt-0.5 text-xs text-zinc-400 font-medium">
              {liveCategory.percentage > 0 ? `${liveCategory.percentage}% Allocation • ` : "Unallocated • "}
              {formatCurrency(totalCatBalance)}
            </p>
          </div>

          <div className="flex items-center gap-2">


            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 hover:text-zinc-100"
            >
              <BsX className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="mt-4 space-y-3">
          {liveCategory.subcategories.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800/60 p-6 text-center text-xs text-zinc-500">
              No sub-stashes created yet.
            </div>
          ) : (
            liveCategory.subcategories.map((sub) => {
              const subTotal = sub.digital + sub.cash;
              const isHidden = Boolean(sub.isHidden);
              const isSubSafe = Boolean(sub.isSafe || liveCategory.isSafe);

              return (
                <div
                  key={sub.id}
                  className={`rounded-2xl bg-zinc-900/40 p-4 transition-all hover:bg-zinc-900/70 ${
                    isHidden
                      ? "border-2 border-dashed border-zinc-800 opacity-50"
                      : "border border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Sub-stash Custom Icon */}
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400 text-zinc-950 transition-colors">
                        <CategoryIcon iconName={sub.icon} className="h-4.5 w-4.5" />
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-semibold text-base text-zinc-100">{sub.name}</h3>

                          {isSubSafe && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                              <BsShieldCheck className="h-3 w-3" /> Safe
                            </span>
                          )}

                          {sub.maxCap && sub.maxCap > 0 ? (
                            <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                              Cap: {formatCurrency(sub.maxCap)}
                            </span>
                          ) : null}

                        </div>
                      </div>
                    </div>

                    <p className="text-lg font-bold tabular-nums text-zinc-100">
                      {formatCurrency(subTotal)}
                    </p>
                  </div>



                  <div className="mt-2.5 flex justify-between border-t border-zinc-800/60 pt-2.5 text-xs text-zinc-400">
                    <span className="w-fit inline-flex items-center gap-1.5 rounded-full bg-neutral-400/10 px-3 py-1 font-medium text-green-200">
                      Digital: <strong className="font-mono">{formatCurrency(sub.digital)}</strong>
                    </span>
                    <span className="w-fit inline-flex items-center gap-1.5 rounded-full bg-neutral-400/10 px-3 py-1 font-medium text-emerald-200">
                      Cash: <strong className="font-mono">{formatCurrency(sub.cash)}</strong>
                    </span>
                  </div>

                  {/* Actions: If Safe, only Transfer is shown! */}
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onTransferSub(sub);
                      }}
                      className="flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded-xl bg-zinc-900 text-xs font-semibold text-zinc-200 transition-all hover:bg-zinc-800 active:scale-95"
                    >
                      <BsArrowLeftRight className="h-3.5 w-3.5 text-emerald-400" />
                      Transfer
                    </button>
                  </div>
                  
                  {/* <div className="mt-3">
                    {isSubSafe ? (
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onTransferSub(sub);
                          }}
                          className="flex min-h-[38px] items-center justify-center gap-1.5 rounded-xl bg-zinc-900 text-xs font-semibold text-zinc-200 transition-all hover:bg-zinc-800 active:scale-95"
                        >
                          <BsArrowLeftRight className="h-3.5 w-3.5 text-emerald-400" />
                          Transfer
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onExpenseSub(sub);
                          }}
                          className="flex min-h-[38px] items-center justify-center gap-1.5 rounded-xl bg-rose-500/10 text-xs font-semibold text-rose-400 transition-all hover:bg-rose-500/20 active:scale-95"
                        >
                          <BsDashLg className="h-3.5 w-3.5" />
                          Subtract Expense
                        </button>
                      </div>
                    )}
                  </div> */}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
