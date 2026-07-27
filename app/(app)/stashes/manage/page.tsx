"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BsArrowLeft,
  BsCheckLg,
  BsExclamationTriangle,
  BsPencil,
  BsPlusLg,
  BsTrash,
} from "react-icons/bs";
import { CATEGORY_ICON_OPTIONS, CategoryIcon } from "../../../components/CategoryIcon";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { formatCurrency } from "../../../lib/finance";
import { useApp } from "../../../lib/store";

export default function ManageStashesPage() {
  const router = useRouter();
  const {
    categories,
    updateAllocations,
    updateSubCategoryIcon,
    addSubCategory,
    renameSubCategoryName,
    removeSubCategory,
    refreshData,
  } = useApp();

  const [percentages, setPercentages] = useState<Record<string, number>>({});
  const [newSubName, setNewSubName] = useState<Record<string, string>>({});
  const [newSubIcon, setNewSubIcon] = useState<Record<string, string>>({});
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editingSubName, setEditingSubName] = useState<string>("");
  const [editingSubIconId, setEditingSubIconId] = useState<string | null>(null);
  const [editingCatIconId, setEditingCatIconId] = useState<string | null>(null);

  // New Category Creation state
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatPercentage, setNewCatPercentage] = useState("10");
  const [selectedIcon, setSelectedIcon] = useState("wallet");

  // Save loading state
  const [isSaving, setIsSaving] = useState(false);

  // Delete Category Confirmation Modal state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    catId: string;
    catName: string;
  }>({ open: false, catId: "", catName: "" });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const initial: Record<string, number> = {};
    for (const cat of categories) {
      initial[cat.id] = cat.percentage;
    }
    setPercentages(initial);
  }, [categories]);

  const totalPercentage = Object.values(percentages).reduce((a, b) => a + b, 0);
  const isValidPercentage = totalPercentage === 100;

  async function handleSavePercentages() {
    if (!isValidPercentage || isSaving) return;
    setIsSaving(true);
    try {
      await updateAllocations(percentages);
      router.push("/stashes");
    } catch (err) {
      console.error("Save allocations error:", err);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdateCategoryIcon(catId: string, icon: string) {
    try {
      const res = await fetch("/api/finance/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: catId, icon }),
      });
      if (res.ok) {
        setEditingCatIconId(null);
        await refreshData();
      }
    } catch (err) {
      console.error("Update category icon error:", err);
    }
  }

  async function handleCreateCategory() {
    const trimmed = newCatName.trim();
    if (!trimmed) return;

    try {
      const res = await fetch("/api/finance/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmed,
          tag: trimmed,
          percentage: Number.parseInt(newCatPercentage, 10) || 0,
          icon: selectedIcon,
        }),
      });

      if (res.ok) {
        setNewCatName("");
        setIsAddingCategory(false);
        await refreshData();
      }
    } catch (err) {
      console.error("Create category error:", err);
    }
  }

  function promptDeleteCategory(catId: string, catName: string) {
    setDeleteConfirm({ open: true, catId, catName });
  }

  async function handleConfirmDeleteCategory() {
    if (!deleteConfirm.catId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/finance/categories?id=${deleteConfirm.catId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await refreshData();
        setDeleteConfirm({ open: false, catId: "", catName: "" });
      }
    } catch (err) {
      console.error("Delete category error:", err);
    } finally {
      setIsDeleting(false);
    }
  }

  function handleAddSub(catId: string) {
    const name = newSubName[catId]?.trim();
    if (!name) return;
    const icon = newSubIcon[catId] || "wallet";
    addSubCategory(catId, name, icon);
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
    <>
      <div className="animate-fade-in max-w-2xl mx-auto space-y-5 px-4 py-4 pb-24">
        {/* Page Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/stashes"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-zinc-300 hover:text-white transition-colors"
            >
              <BsArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                MANAGE STASHES
              </span>
              <h1 className="text-xl font-bold tracking-tight text-zinc-100">
                Categories & Split Rules
              </h1>
            </div>
          </div>

          <button
            type="button"
            disabled={!isValidPercentage || isSaving}
            onClick={handleSavePercentages}
            className="flex items-center gap-1.5 rounded-full bg-emerald-500 p-3 text-xs font-bold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-95 disabled:opacity-30"
          >
            <BsCheckLg className="h-5 w-5" />
          </button>
        </header>

        {/* Allocation Split Banner */}
        <section className="rounded-2xl bg-zinc-900/60 p-4 border border-zinc-800/40">
          <div className="flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2">
              {isValidPercentage ? (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                  <BsCheckLg className="h-4 w-4" />
                </div>
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
                  <BsExclamationTriangle className="h-4 w-4" />
                </div>
              )}
              <div>
                <p className="text-zinc-100 font-bold">
                  {isValidPercentage ? "100% Allocation Balance" : "Allocation Split Incomplete"}
                </p>
                <p className="text-[11px] text-zinc-400 font-normal mt-0.5">
                  {isValidPercentage
                    ? "Income will be automatically split according to these rules"
                    : "Total allocation percentage must equal exactly 100%"}
                </p>
              </div>
            </div>
            <span
              className={`font-mono text-base font-extrabold ${
                isValidPercentage ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {totalPercentage}%
            </span>
          </div>

          <div className="mt-3.5 h-2 overflow-hidden rounded-full bg-zinc-950">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isValidPercentage ? "bg-emerald-500" : "bg-amber-500"
              }`}
              style={{ width: `${Math.min(100, totalPercentage)}%` }}
            />
          </div>
        </section>

        {/* Create New Main Category Section */}
        {isAddingCategory ? (
          <section className="rounded-2xl bg-zinc-900/80 p-5 border border-emerald-500/30">
            <h3 className="text-sm font-bold text-emerald-400">Add New Main Category</h3>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Category Name (e.g. Investments)"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="col-span-2 min-h-[42px] rounded-xl bg-zinc-950 px-3.5 text-xs text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <input
                type="number"
                placeholder="%"
                value={newCatPercentage}
                onChange={(e) => setNewCatPercentage(e.target.value)}
                className="min-h-[42px] rounded-xl bg-zinc-950 px-3.5 text-xs font-bold text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Icon Chooser */}
            <div className="mt-3.5">
              <span className="text-[11px] font-medium text-zinc-400">Choose Main Icon</span>
              <div className="mt-2 flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
                {CATEGORY_ICON_OPTIONS.map((opt) => {
                  const IconComp = opt.icon;
                  const isSelected = selectedIcon === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedIcon(opt.id)}
                      className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                        isSelected
                          ? "bg-emerald-500 text-zinc-950 font-bold scale-105"
                          : "bg-zinc-950 text-zinc-400 hover:text-zinc-200"
                      }`}
                      title={opt.label}
                    >
                      <IconComp className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsAddingCategory(false)}
                className="rounded-xl bg-zinc-950 px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateCategory}
                className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-emerald-400"
              >
                Create Category
              </button>
            </div>
          </section>
        ) : (
          <button
            type="button"
            onClick={() => setIsAddingCategory(true)}
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900/40 text-xs font-semibold text-emerald-400 transition-all hover:bg-zinc-900 border border-dashed border-zinc-800"
          >
            <BsPlusLg className="h-3.5 w-3.5" />
            Add Main Category
          </button>
        )}

        {/* Main Categories & Sub-stashes List */}
        <div className="space-y-4">
          {categories.map((cat) => {
            const currentPct = percentages[cat.id] ?? cat.percentage;

            return (
              <section key={cat.id} className="rounded-2xl bg-zinc-900/60 p-5 border border-zinc-800/40 space-y-4">
                {/* Main Stash Category Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingCatIconId(editingCatIconId === cat.id ? null : cat.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-emerald-400 hover:bg-zinc-700 transition-colors shrink-0"
                      title="Change Main Category Icon"
                    >
                      <CategoryIcon iconName={cat.icon} className="h-5 w-5" />
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-base text-zinc-100">{cat.name}</h2>
                        <button
                          type="button"
                          onClick={() => setEditingCatIconId(editingCatIconId === cat.id ? null : cat.id)}
                          className="text-zinc-500 hover:text-emerald-400 transition-colors"
                          title="Change Icon"
                        >
                          <BsPencil className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-zinc-400 font-medium mt-0.5">
                        {cat.subcategories.length} sub-stashes
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
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
                        className="w-14 rounded-xl bg-zinc-950 px-2.5 py-1.5 text-right text-sm font-bold text-emerald-400 outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <span className="text-xs text-zinc-400 font-bold">%</span>
                    </div>

                    {categories.length > 1 && (
                      <button
                        type="button"
                        onClick={() => promptDeleteCategory(cat.id, cat.name)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-950 text-zinc-500 hover:text-rose-400 transition-colors"
                        title="Delete Category"
                      >
                        <BsTrash className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline Icon Picker for Main Stash */}
                {editingCatIconId === cat.id && (
                  <div className="rounded-xl bg-zinc-950 p-3 border border-zinc-800/60">
                    <span className="text-[11px] font-medium text-zinc-400">
                      Choose icon for "{cat.name}" Main Stash
                    </span>
                    <div className="mt-2 flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                      {CATEGORY_ICON_OPTIONS.map((opt) => {
                        const IconComp = opt.icon;
                        const isSelected = (cat.icon || "wallet") === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleUpdateCategoryIcon(cat.id, opt.id)}
                            className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                              isSelected
                                ? "bg-emerald-500 text-zinc-950 font-bold scale-105"
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

                {/* Percentage Range Slider */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={currentPct}
                  onChange={(e) => {
                    const val = Number.parseInt(e.target.value, 10);
                    setPercentages((prev) => ({ ...prev, [cat.id]: val }));
                  }}
                  className="w-full accent-emerald-500"
                />

                {/* Sub-stashes Section */}
                <div className="pt-3 border-t border-zinc-800/40 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    Sub-stashes
                  </span>

                  <div className="space-y-2">
                    {cat.subcategories.map((sub) => (
                      <div key={sub.id} className="rounded-xl bg-zinc-950/80 p-3 text-xs border border-zinc-800/20">
                        <div className="flex items-center justify-between">
                          {editingSubId === sub.id ? (
                            <div className="flex flex-1 items-center gap-2">
                              <input
                                type="text"
                                value={editingSubName}
                                onChange={(e) => setEditingSubName(e.target.value)}
                                className="flex-1 rounded-lg bg-zinc-900 px-2.5 py-1 text-xs text-white outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveRename(sub.id)}
                                className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-bold text-zinc-950"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditingSubIconId(editingSubIconId === sub.id ? null : sub.id)
                                  }
                                  className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-emerald-400 hover:bg-zinc-800 transition-colors"
                                  title="Change Icon"
                                >
                                  <CategoryIcon iconName={sub.icon} className="h-3.5 w-3.5" />
                                </button>
                                <span className="font-semibold text-zinc-200 text-sm">{sub.name}</span>
                              </div>

                              <div className="flex items-center gap-3 text-zinc-400">
                                <span className="tabular-nums font-mono text-zinc-300 font-bold">
                                  {formatCurrency(sub.digital + sub.cash)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditingSubIconId(editingSubIconId === sub.id ? null : sub.id)
                                  }
                                  className="text-zinc-400 hover:text-emerald-400 transition-colors"
                                  title="Change Icon"
                                >
                                  <BsPencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeSubCategory(sub.id)}
                                  className="text-zinc-400 hover:text-rose-400 transition-colors"
                                  title="Delete Sub-stash"
                                >
                                  <BsTrash className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Inline Sub-stash Icon Picker */}
                        {editingSubIconId === sub.id && (
                          <div className="mt-2.5 rounded-lg bg-zinc-900 p-2.5 border border-zinc-800/60">
                            <span className="text-[10px] font-medium text-zinc-400">
                              Choose Icon for "{sub.name}"
                            </span>
                            <div className="mt-1.5 flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
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
                                    className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${
                                      isSelected
                                        ? "bg-emerald-500 text-zinc-950 font-bold"
                                        : "bg-zinc-950 text-zinc-400 hover:text-zinc-100"
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
                      </div>
                    ))}
                  </div>

                  {/* Add Sub-stash Inline Form */}
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      placeholder={`Add new sub-stash to ${cat.name}...`}
                      value={newSubName[cat.id] || ""}
                      onChange={(e) =>
                        setNewSubName((prev) => ({ ...prev, [cat.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddSub(cat.id);
                      }}
                      className="min-h-[38px] flex-1 rounded-xl bg-zinc-950 px-3 text-xs text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSub(cat.id)}
                      className="min-h-[38px] rounded-xl bg-zinc-800 px-3.5 text-xs font-semibold text-emerald-400 transition-colors hover:bg-zinc-700 flex items-center gap-1 shrink-0"
                    >
                      <BsPlusLg className="h-3 w-3" /> Add
                    </button>
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        {/* Bottom Floating Save Action */}
        <div className="fixed bottom-16 left-0 right-0 p-4 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent pointer-events-none">
          <div className="max-w-2xl mx-auto pointer-events-auto">
            <button
              type="button"
              disabled={!isValidPercentage || isSaving}
              onClick={handleSavePercentages}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-sm font-bold text-zinc-950 shadow-xl transition-all hover:bg-emerald-400 active:scale-[0.99] disabled:opacity-30"
            >
              <BsCheckLg className="h-4 w-4" />
              {isSaving ? "Saving Allocation Rules…" : "Save Allocation Rules"}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Delete Category */}
      <ConfirmModal
        open={deleteConfirm.open}
        title="Delete Category"
        description={`Are you sure you want to delete "${deleteConfirm.catName}" category and all its stashes?`}
        confirmText="Delete Category"
        loading={isDeleting}
        onConfirm={handleConfirmDeleteCategory}
        onClose={() => setDeleteConfirm({ open: false, catId: "", catName: "" })}
      />
    </>
  );
}
