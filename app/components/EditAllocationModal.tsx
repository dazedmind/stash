"use client";

import { useEffect, useState } from "react";
import { BsCheckLg, BsExclamationTriangle, BsPencil, BsPlusLg, BsTrash, BsX } from "react-icons/bs";
import { formatCurrency } from "../lib/finance";
import { useApp } from "../lib/store";

interface EditAllocationModalProps {
  open: boolean;
  onClose: () => void;
}

export function EditAllocationModal({ open, onClose }: EditAllocationModalProps) {
  const {
    categories,
    updateAllocations,
    addSubCategory,
    renameSubCategoryName,
    removeSubCategory,
  } = useApp();

  const [percentages, setPercentages] = useState<Record<string, number>>({});
  const [newSubName, setNewSubName] = useState<Record<string, string>>({});
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editingSubName, setEditingSubName] = useState<string>("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      const initial: Record<string, number> = {};
      for (const cat of categories) {
        initial[cat.id] = cat.percentage;
      }
      setPercentages(initial);
      setNewSubName({});
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [open, categories]);

  if (!open) return null;

  const totalPercentage = Object.values(percentages).reduce((a, b) => a + b, 0);
  const isValidPercentage = totalPercentage === 100;

  function handleSavePercentages() {
    if (!isValidPercentage) return;
    updateAllocations(percentages);
    onClose();
  }

  function handleAddSub(catId: string) {
    const name = newSubName[catId]?.trim();
    if (!name) return;
    addSubCategory(catId, name);
    setNewSubName((prev) => ({ ...prev, [catId]: "" }));
  }

  function handleStartRename(subId: string, currentName: string) {
    setEditingSubId(subId);
    setEditingSubName(currentName);
  }

  function handleSaveRename(subId: string) {
    if (editingSubName.trim()) {
      renameSubCategoryName(subId, editingSubName.trim());
    }
    setEditingSubId(null);
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
        className={`relative w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-t-3xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl transition-transform duration-200 ease-out ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="mx-auto mb-4 h-1 w-8 rounded-full bg-zinc-800" />

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-100">Edit Categories & Allocation</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 hover:text-zinc-100"
          >
            <BsX className="h-5 w-5" />
          </button>
        </div>

        {/* Total indicator with warning yellow / valid light blue styling */}
        <div
          className={`mt-4 flex items-center justify-between rounded-xl border p-3 text-xs font-semibold ${
            isValidPercentage
              ? "border-zinc-800 bg-zinc-900/60 text-zinc-300"
              : "border-amber-500/40 bg-amber-500/10 text-amber-400"
          }`}
        >
          <div className="flex items-center gap-1.5">
            {isValidPercentage ? (
              <BsCheckLg className="h-4 w-4 text-emerald-400" />
            ) : (
              <BsExclamationTriangle className="h-4 w-4 text-amber-400" />
            )}
            <span>{isValidPercentage ? "Valid Allocation Split" : "Allocation Must Equal 100%"}</span>
          </div>
          <span className="font-mono text-sm">{totalPercentage}%</span>
        </div>

        {/* Categories editor */}
        <div className="mt-4 space-y-4">
          {categories.map((cat) => {
            const currentPct = percentages[cat.id] ?? cat.percentage;

            return (
              <div key={cat.id} className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-zinc-100">{cat.name}</h3>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={currentPct}
                      onChange={(e) => {
                        const val = Math.min(100, Math.max(0, Number.parseInt(e.target.value, 10) || 0));
                        setPercentages((prev) => ({ ...prev, [cat.id]: val }));
                      }}
                      className="w-14 rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1 text-right text-xs font-bold text-zinc-100 outline-none focus:border-zinc-700"
                    />
                    <span className="text-xs text-zinc-400">%</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={currentPct}
                  onChange={(e) => {
                    const val = Number.parseInt(e.target.value, 10);
                    setPercentages((prev) => ({ ...prev, [cat.id]: val }));
                  }}
                  className="mt-3 w-full accent-sky-400"
                />

                {/* Subcategories list */}
                <div className="mt-3 border-t border-zinc-800/60 pt-3">
                  <div className="space-y-1.5">
                    {cat.subcategories.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between rounded-xl bg-zinc-900/80 px-3 py-2 text-xs"
                      >
                        {editingSubId === sub.id ? (
                          <div className="flex flex-1 items-center gap-2">
                            <input
                              type="text"
                              value={editingSubName}
                              onChange={(e) => setEditingSubName(e.target.value)}
                              className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-white outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveRename(sub.id)}
                              className="rounded-lg bg-zinc-200 px-2.5 py-1 text-xs font-bold text-zinc-950"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="font-medium text-zinc-200">{sub.name}</span>
                            <div className="flex items-center gap-3 text-zinc-400">
                              <span className="tabular-nums font-mono text-zinc-300">
                                {formatCurrency(sub.digital + sub.cash)}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleStartRename(sub.id, sub.name)}
                                className="text-zinc-400 hover:text-zinc-100 transition-colors"
                                title="Rename"
                              >
                                <BsPencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeSubCategory(sub.id)}
                                className="text-zinc-400 hover:text-rose-400 transition-colors"
                                title="Delete"
                              >
                                <BsTrash className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add subcategory */}
                  <div className="mt-2.5 flex gap-2">
                    <input
                      type="text"
                      placeholder={`Add sub-stash to ${cat.name}...`}
                      value={newSubName[cat.id] || ""}
                      onChange={(e) =>
                        setNewSubName((prev) => ({ ...prev, [cat.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddSub(cat.id);
                      }}
                      className="min-h-[36px] flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 outline-none focus:border-zinc-700"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSub(cat.id)}
                      className="min-h-[36px] rounded-xl bg-zinc-800 px-3 text-xs font-semibold text-zinc-200 transition-colors hover:bg-zinc-700 flex items-center gap-1"
                    >
                      <BsPlusLg className="h-3 w-3" /> Add
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          disabled={!isValidPercentage}
          onClick={handleSavePercentages}
          className="mt-5 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 text-sm font-bold text-zinc-950 transition-all hover:bg-emerald-300 active:scale-[0.99] disabled:opacity-30"
        >
          <BsCheckLg className="h-4 w-4" />
          Save Allocation Rules
        </button>
      </div>
    </div>
  );
}
