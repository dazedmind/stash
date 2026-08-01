"use client";

import { useEffect, useState } from "react";
import { BsArrowLeftRight, BsDashLg, BsPencil, BsX } from "react-icons/bs";
import { formatCurrency, getCategoryTotalBalance, type MainCategory, type SubCategory } from "../lib/finance";
import { useApp } from "../lib/store";
import { CATEGORY_ICON_OPTIONS, CategoryIcon } from "./CategoryIcon";
import { Switch } from "./ui/switch";

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
  const { categories, toggleHideSubCategory, updateSubCategoryIcon } = useApp();
  const [visible, setVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSubIconId, setEditingSubIconId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setIsEditing(false);
      setEditingSubIconId(null);
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
            <h2 className="text-xl font-bold tracking-tight text-zinc-100">{liveCategory.name} Stashes</h2>
            <p className="mt-0.5 text-xs text-zinc-400 font-medium">
              {liveCategory.percentage > 0 ? `${liveCategory.percentage}% Allocation • ` : "Unallocated • "}
              {formatCurrency(totalCatBalance)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Edit Mode Toggle Button beside Close Button */}
            <button
              type="button"
              onClick={() => {
                setIsEditing(!isEditing);
                setEditingSubIconId(null);
              }}
              className={`flex min-h-[32px] items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-all ${
                isEditing
                  ? "bg-emerald-500 text-zinc-950 font-bold"
                  : "bg-zinc-900 text-zinc-300 hover:text-zinc-100"
              }`}
            >
              <BsPencil className="h-3 w-3" />
              {isEditing ? "Done" : "Edit"}
            </button>

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

              return (
                <div
                  key={sub.id}
                  className="rounded-2xl bg-zinc-900/40 p-4 transition-all hover:bg-zinc-900/70"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Sub-stash Custom Icon */}
                      <button
                        type="button"
                        disabled={!isEditing}
                        onClick={() =>
                          isEditing && setEditingSubIconId(editingSubIconId === sub.id ? null : sub.id)
                        }
                        className={`flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-emerald-400 transition-colors ${
                          isEditing ? "hover:bg-zinc-800 cursor-pointer" : "cursor-default"
                        }`}
                        title={isEditing ? "Change Sub-stash Icon" : undefined}
                      >
                        <CategoryIcon iconName={sub.icon} className="h-4.5 w-4.5" />
                      </button>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-semibold text-base text-zinc-100">{sub.name}</h3>
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() =>
                                setEditingSubIconId(editingSubIconId === sub.id ? null : sub.id)
                              }
                              className="text-zinc-500 hover:text-zinc-300 transition-colors"
                              title="Choose Icon"
                            >
                              <BsPencil className="h-3 w-3" />
                            </button>
                          )}
                        </div>

                        {/* Hide from total balance Switch (Visible ONLY when isEditing is true) */}
                        {isEditing && (
                          <div className="mt-1 flex items-center gap-2">
                            <Switch
                              id={`hide-switch-${sub.id}`}
                              checked={isHidden}
                              onCheckedChange={() => toggleHideSubCategory(sub.id)}
                            />
                            <label
                              htmlFor={`hide-switch-${sub.id}`}
                              className="cursor-pointer text-[11px] font-medium select-none"
                            >
                              {isHidden ? (
                                <span className="text-zinc-400 font-semibold">Hide from total</span>
                              ) : (
                                <span className="text-zinc-400">Hide from total</span>
                              )}
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-lg font-bold tabular-nums text-zinc-100">
                      {formatCurrency(subTotal)}
                    </p>
                  </div>

                  {/* Icon Chooser for Sub-stash (Visible ONLY in Edit mode) */}
                  {isEditing && editingSubIconId === sub.id && (
                    <div className="mt-3 rounded-xl bg-zinc-950 p-3 border border-zinc-800/60">
                      <span className="text-[11px] font-medium text-zinc-400">
                        Choose icon for "{sub.name}"
                      </span>
                      <div className="mt-2 flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                        {CATEGORY_ICON_OPTIONS.map((opt) => {
                          const IconComp = opt.icon;
                          const isSelected = (sub.icon || "wallet") === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                updateSubCategoryIcon(sub.id, opt.id);
                                setEditingSubIconId(null);
                              }}
                              className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                                isSelected
                                  ? "bg-emerald-500 text-zinc-950 font-bold"
                                  : "bg-zinc-900 text-zinc-400 hover:text-zinc-100"
                              }`}
                              title={opt.label}
                            >
                              <IconComp className="h-3.5 w-3.5" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="mt-2.5 flex justify-between border-t border-zinc-800/60 pt-2.5 text-xs text-zinc-400">
                    <span className="w-fit inline-flex items-center gap-1.5 rounded-full bg-neutral-400/10 px-3 py-1 font-medium text-green-200">
                      Digital: <strong className="font-mono">{formatCurrency(sub.digital)}</strong>
                    </span>
                    <span className="w-fit inline-flex items-center gap-1.5 rounded-full bg-neutral-400/10 px-3 py-1 font-medium text-emerald-200">
                      Cash: <strong className="font-mono">{formatCurrency(sub.cash)}</strong>
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
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
                      Expense
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
