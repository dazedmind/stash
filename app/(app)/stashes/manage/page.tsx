"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BsArrowLeft,
  BsCheckLg,
  BsExclamationTriangle,
  BsGripVertical,
  BsPencil,
  BsPlusLg,
  BsShieldCheck,
  BsTrash,
} from "react-icons/bs";
import { CATEGORY_ICON_OPTIONS, CategoryIcon } from "../../../components/CategoryIcon";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { Switch } from "../../../components/ui/switch";
import { formatCurrency, type MainCategory } from "../../../lib/finance";
import { useApp } from "../../../lib/store";

export default function ManageStashesPage() {
  const router = useRouter();
  const {
    categories,
    allSubcategories,
    updateAllocations,
    reorderCategories,
    updateSubCategoryIcon,
    addSubCategory,
    renameSubCategoryName,
    removeSubCategory,
    refreshData,
  } = useApp();

  const [percentages, setPercentages] = useState<Record<string, number>>({});
  const [newSubName, setNewSubName] = useState<Record<string, string>>({});
  const [newSubIcon, setNewSubIcon] = useState<Record<string, string>>({});

  // Category Name Editing
  const [editingCatNameId, setEditingCatNameId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState<string>("");

  // Sub-stash Name Editing
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editingSubName, setEditingSubName] = useState<string>("");

  // Icon Editing
  const [editingSubIconId, setEditingSubIconId] = useState<string | null>(null);
  const [editingCatIconId, setEditingCatIconId] = useState<string | null>(null);

  // Single Capping input state per sub-stash
  const [maxCaps, setMaxCaps] = useState<Record<string, string>>({});

  // Drag and Drop reordering state
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

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
    const initialPct: Record<string, number> = {};
    for (const cat of categories) {
      initialPct[cat.id] = cat.percentage;
    }
    setPercentages(initialPct);

    // Initialize sub-stash cap values
    const capMap: Record<string, string> = {};
    for (const sub of allSubcategories) {
      capMap[sub.id] = sub.maxCap ? String(sub.maxCap) : "0";
    }
    setMaxCaps(capMap);
  }, [categories, allSubcategories]);

  const totalPercentage = Object.values(percentages).reduce((a, b) => a + b, 0);
  const isExact100 = totalPercentage === 100;

  async function handleSavePercentages() {
    if (!isExact100 || isSaving) return;
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

  // Drag and Drop Handlers for Main Stashes
  function handleDragStart(e: React.DragEvent, index: number) {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIdx !== index) {
      setDragOverIdx(index);
    }
  }

  function handleDrop(e: React.DragEvent, targetIndex: number) {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetIndex) return;

    const newCats = [...categories];
    const [removed] = newCats.splice(draggedIdx, 1);
    newCats.splice(targetIndex, 0, removed);

    reorderCategories(newCats);
    setDraggedIdx(null);
    setDragOverIdx(null);
  }

  function handleDragEnd() {
    setDraggedIdx(null);
    setDragOverIdx(null);
  }

  function handleTouchStart(index: number) {
    longPressTimerRef.current = setTimeout(() => {
      setDraggedIdx(index);
    }, 300);
  }

  function handleTouchMove() {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }

  function handleTouchEnd() {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }

  async function handleUpdateCategory(catId: string, payload: Record<string, any>) {
    try {
      const res = await fetch("/api/finance/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: catId, ...payload }),
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (err) {
      console.error("Update category error:", err);
    }
  }

  async function handleUpdateSubCategory(subId: string, payload: Record<string, any>) {
    try {
      const res = await fetch("/api/finance/subcategories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subCategoryId: subId, ...payload }),
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (err) {
      console.error("Update subcategory error:", err);
    }
  }

  async function handleSaveCatName(catId: string) {
    if (editingCatName.trim()) {
      await handleUpdateCategory(catId, { name: editingCatName.trim() });
    }
    setEditingCatNameId(null);
  }

  async function handleSaveCap(subId: string) {
    const cap = Number.parseInt(maxCaps[subId] || "0", 10) || 0;
    await handleUpdateSubCategory(subId, { maxCap: cap });
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

  function handleSaveSubRename(subId: string) {
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
                Categories & Sub-stashes
              </h1>
            </div>
          </div>

          <button
            type="button"
            disabled={!isExact100 || isSaving}
            onClick={handleSavePercentages}
            className="flex items-center gap-1.5 rounded-full bg-emerald-500 p-3 text-xs font-bold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-95 disabled:opacity-30"
            title="Save Allocation Rules"
          >
            <BsCheckLg className="h-5 w-5" />
          </button>
        </header>

        {/* Allocation Split Warning Banner: Shown ONLY when totalPercentage !== 100 */}
        {!isExact100 && (
          <section className="rounded-2xl bg-amber-500/10 p-4 border border-amber-500/30 animate-fade-in">
            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                  <BsExclamationTriangle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-amber-300 font-bold">Allocation Split Warning</p>
                </div>
              </div>
              <span className="font-mono text-base font-extrabold text-amber-400">
                {totalPercentage}%
              </span>
            </div>
          </section>
        )}

        {/* Create New Main Category Section */}
        {isAddingCategory ? (
          <section className="rounded-2xl bg-zinc-900/80 p-5 border border-emerald-500/30 space-y-3">
            <h3 className="text-sm font-bold text-emerald-400">Add New Main Category</h3>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Category Name"
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
            <div>
              <span className="text-[11px] font-medium text-zinc-400">Choose Icon</span>
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

            <div className="flex gap-2 justify-end pt-2">
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

        {/* Main Categories & Sub-stashes List (Supports Long-Press & Drag reordering) */}
        <div className="space-y-4">
          {categories.map((cat, idx) => {
            const currentPct = percentages[cat.id] ?? cat.percentage;
            const isDragging = draggedIdx === idx;
            const isDragOver = dragOverIdx === idx;

            return (
              <section
                key={cat.id}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
                onTouchStart={() => handleTouchStart(idx)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className={`rounded-2xl bg-zinc-900/60 p-5 border transition-all duration-200 space-y-4 ${
                  isDragging
                    ? "opacity-40 scale-[0.98] border-emerald-500"
                    : isDragOver
                    ? "border-emerald-500/80 bg-emerald-500/5 ring-2 ring-emerald-500/30"
                    : "border-zinc-800/40"
                }`}
              >
                {/* Main Stash Category Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Drag Handle Grip Icon for Long-Press / Mouse Drag */}
                    <div
                      className="cursor-grab active:cursor-grabbing text-zinc-500 hover:text-emerald-400 p-1 rounded transition-colors touch-none"
                      title="Hold / Drag to reorder stash"
                    >
                      <BsGripVertical className="h-5 w-5" />
                    </div>

                    <button
                      type="button"
                      onClick={() => setEditingCatIconId(editingCatIconId === cat.id ? null : cat.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-emerald-400 hover:bg-zinc-700 transition-colors shrink-0"
                      title="Change Icon"
                    >
                      <CategoryIcon iconName={cat.icon} className="h-5 w-5" />
                    </button>

                    <div>
                      {editingCatNameId === cat.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingCatName}
                            onChange={(e) => setEditingCatName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveCatName(cat.id);
                            }}
                            className="rounded-lg bg-zinc-950 px-2.5 py-1 text-sm font-bold text-white outline-none border border-emerald-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveCatName(cat.id)}
                            className="rounded-lg bg-emerald-500 px-2.5 py-1 text-xs font-bold text-zinc-950"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <h2 className="font-bold text-base text-zinc-100">{cat.name}</h2>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCatNameId(cat.id);
                              setEditingCatName(cat.name);
                            }}
                            className="text-zinc-500 hover:text-emerald-400 transition-colors"
                            title="Edit Category Name"
                          >
                            <BsPencil className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
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

                {/* Safe Category Toggle with Switch Component */}
                <div className="flex items-center justify-between rounded-xl p-2 text-xs ">
                  <div className="flex items-center gap-2">
                    <BsShieldCheck className="h-4 w-4 text-emerald-400" />
                    <div>
                      <span className="font-semibold text-zinc-200">Tag Category as Safe</span>
                    </div>
                  </div>
                  <Switch
                    id={`safe-switch-${cat.id}`}
                    checked={Boolean(cat.isSafe)}
                    onCheckedChange={(checked) => handleUpdateCategory(cat.id, { isSafe: checked })}
                  />
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
                            onClick={() => {
                              handleUpdateCategory(cat.id, { icon: opt.id });
                              setEditingCatIconId(null);
                            }}
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

                {/* Sub-stashes Section */}
                <div className="pt-3 border-t border-zinc-800/40 space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    Sub-stashes
                  </span>

                  <div className="space-y-2.5">
                    {cat.subcategories.map((sub) => {
                      return (
                        <div
                          key={sub.id}
                          className="rounded-xl bg-zinc-950/80 p-3.5 text-xs border border-zinc-800/30 space-y-3"
                        >
                          <div className="flex items-center justify-between gap-2">
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
                                  onClick={() => handleSaveSubRename(sub.id)}
                                  className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-bold text-zinc-950"
                                >
                                  Save
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-2.5 flex-wrap">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setEditingSubIconId(editingSubIconId === sub.id ? null : sub.id)
                                    }
                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-emerald-400 hover:bg-zinc-800 transition-colors"
                                    title="Change Icon"
                                  >
                                    <CategoryIcon iconName={sub.icon} className="h-4 w-4" />
                                  </button>

                                  <div className="flex items-center gap-1.5">
                                    <span className="font-semibold text-zinc-100 text-sm">{sub.name}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingSubId(sub.id);
                                        setEditingSubName(sub.name);
                                      }}
                                      className="text-zinc-500 hover:text-emerald-400 transition-colors"
                                      title="Edit Sub-stash Name"
                                    >
                                      <BsPencil className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2.5 text-zinc-400">
                                  <span className="tabular-nums font-mono text-zinc-200 font-bold text-sm">
                                    {formatCurrency(sub.digital + sub.cash)}
                                  </span>

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
                            <div className="rounded-lg bg-zinc-900 p-2.5 border border-zinc-800/60">
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

                          {/* Single Capping Field */}
                          <div className="flex items-center gap-2 rounded-lg justify-between">
                            <span className="text-[11px] font-medium text-zinc-400">Max Cap (₱)</span>
                            <input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={maxCaps[sub.id] ?? sub.maxCap ?? 0}
                              onChange={(e) =>
                                setMaxCaps((prev) => ({ ...prev, [sub.id]: e.target.value }))
                              }
                              onBlur={() => handleSaveCap(sub.id)}
                              className="w-24 rounded-md bg-zinc-950 px-2.5 py-1 text-right font-mono text-xs font-bold text-emerald-400 outline-none border border-zinc-800"
                            />
                          </div>
                        </div>
                      );
                    })}
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
