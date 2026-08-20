"use client";

import { useEffect, useState } from "react";
import { BsTrash, BsShieldCheck, BsShield, BsCheck2, BsPencil, BsEye, BsEyeSlash } from "react-icons/bs";
import { type MainCategory } from "../lib/finance";
import { useApp } from "../lib/store";
import { CATEGORY_ICON_OPTIONS, CategoryIcon } from "./CategoryIcon";

interface CategorySettingsSheetProps {
  open: boolean;
  onClose: () => void;
  category: MainCategory | null;
}

export function CategorySettingsSheet({ open, onClose, category }: CategorySettingsSheetProps) {
  const { updateCategorySettings, removeCategory } = useApp();
  const [visible, setVisible] = useState(false);

  // Local states for edits
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("wallet");
  const [isSafe, setIsSafe] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [showInHomescreen, setShowInHomescreen] = useState(true);

  // Icon picker state
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

  useEffect(() => {
    if (open && category) {
      setName(category.name);
      setIcon(category.icon || "wallet");
      setIsSafe(!!category.isSafe);
      setIsHidden(!!category.isHidden);
      setShowInHomescreen(category.showInHomescreen ?? true);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      setIsIconPickerOpen(false);
    }
  }, [open, category]);

  if (!open || !category) return null;

  async function handleSave() {
    if (!category) return;
    
    await updateCategorySettings(category.id, {
      name: name.trim() || category.name,
      icon,
      isSafe,
      isHidden,
      showInHomescreen,
    });
    onClose();
  }

  async function handleDelete() {
    if (!category) return;
    if (confirm(`Are you sure you want to delete "${category.name}" and all its sub-stashes?`)) {
      await removeCategory(category.id);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close settings"
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

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-100">Main Stash Settings</h2>
        </div>

        <div className="mt-6 space-y-5">
          {/* Identity Section: Icon and Name */}
          <div className="flex gap-4 items-center">
            <button
              type="button"
              onClick={() => setIsIconPickerOpen(!isIconPickerOpen)}
              className="group relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 transition-colors hover:bg-zinc-800"
            >
              <CategoryIcon iconName={icon} className="h-7 w-7 text-emerald-400" />
              <div className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-1 text-zinc-950 shadow-md">
                <BsPencil className="h-3 w-3" />
              </div>
            </button>
            <label className="flex-1 block">
              <span className="text-xs text-zinc-400 font-medium ml-1">Category Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Category Name"
              />
            </label>
          </div>

          {/* Inline Icon Picker */}
          {isIconPickerOpen && (
            <div className="rounded-xl bg-zinc-900 p-3 border border-zinc-800/60 animate-fade-in">
              <span className="text-[11px] font-medium text-zinc-400">
                Choose Icon
              </span>
              <div className="mt-2 flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
                {CATEGORY_ICON_OPTIONS.map((opt) => {
                  const IconComp = opt.icon;
                  const isSelected = icon === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setIcon(opt.id);
                        setIsIconPickerOpen(false);
                      }}
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
          )}

          <div className="h-px bg-zinc-800/50" />

          {/* Toggles */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setIsSafe(!isSafe)}
              className="flex w-full items-center justify-between rounded-xl bg-zinc-900/40 p-3 hover:bg-zinc-900 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isSafe ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                  {isSafe ? <BsShieldCheck className="h-4 w-4" /> : <BsShield className="h-4 w-4" />}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-zinc-200">Tag as Safe</p>
                  <p className="text-[10px] text-zinc-500">Prevent direct expenses for all stashes inside</p>
                </div>
              </div>
              <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isSafe ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isSafe ? 'translate-x-4.5' : 'translate-x-1'}`} />
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIsHidden(!isHidden)}
              className="flex w-full items-center justify-between rounded-xl bg-zinc-900/40 p-3 hover:bg-zinc-900 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isHidden ? 'bg-rose-500/20 text-rose-400' : 'bg-zinc-800 text-zinc-400'}`}>
                  {isHidden ? <BsEyeSlash className="h-4 w-4" /> : <BsEye className="h-4 w-4" />}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-zinc-200">Hide from Total Balance</p>
                  <p className="text-[10px] text-zinc-500">Hide this category and its sub-stashes from total</p>
                </div>
              </div>
              <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isHidden ? 'bg-rose-500' : 'bg-zinc-700'}`}>
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isHidden ? 'translate-x-4.5' : 'translate-x-1'}`} />
              </div>
            </button>

            <button
              type="button"
              onClick={() => setShowInHomescreen(!showInHomescreen)}
              className="flex w-full items-center justify-between rounded-xl bg-zinc-900/40 p-3 hover:bg-zinc-900 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${showInHomescreen ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                  {showInHomescreen ? <BsEye className="h-4 w-4" /> : <BsEyeSlash className="h-4 w-4" />}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-zinc-200">Show in Homescreen</p>
                  <p className="text-[10px] text-zinc-500">Display this category on the main homescreen</p>
                </div>
              </div>
              <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${showInHomescreen ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${showInHomescreen ? 'translate-x-4.5' : 'translate-x-1'}`} />
              </div>
            </button>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={handleDelete}
            className="flex min-h-[48px] w-14 items-center justify-center rounded-xl bg-zinc-900 text-rose-400 transition-colors hover:bg-rose-500/20"
          >
            <BsTrash className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 text-sm font-bold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-[0.99]"
          >
            <BsCheck2 className="h-5 w-5" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
