"use client";

import { useEffect, useState } from "react";
import { BsTrash, BsShieldCheck, BsShield, BsEyeSlash, BsEye, BsCheck2, BsPencil } from "react-icons/bs";
import { type SubCategory } from "../lib/finance";
import { useApp } from "../lib/store";
import { CATEGORY_ICON_OPTIONS, CategoryIcon } from "./CategoryIcon";

interface SubStashSettingsSheetProps {
  open: boolean;
  onClose: () => void;
  subStash: SubCategory | null;
}

export function SubStashSettingsSheet({ open, onClose, subStash }: SubStashSettingsSheetProps) {
  const { updateSubCategorySettings, removeSubCategory } = useApp();
  const [visible, setVisible] = useState(false);

  // Local states for edits
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("wallet");
  const [maxCap, setMaxCap] = useState("");
  const [isHidden, setIsHidden] = useState(false);
  const [isSafe, setIsSafe] = useState(false);

  // Icon picker state
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

  useEffect(() => {
    if (open && subStash) {
      setName(subStash.name);
      setIcon(subStash.icon || "wallet");
      setMaxCap(subStash.maxCap && subStash.maxCap > 0 ? String(subStash.maxCap) : "");
      setIsHidden(!!subStash.isHidden);
      setIsSafe(!!subStash.isSafe);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      setIsIconPickerOpen(false);
    }
  }, [open, subStash]);

  if (!open || !subStash) return null;

  async function handleSave() {
    if (!subStash) return;
    const parsedCap = parseInt(maxCap.replace(/\D/g, ""), 10) || 0;
    
    await updateSubCategorySettings(subStash.id, {
      name: name.trim() || subStash.name,
      icon,
      maxCap: parsedCap,
      isHidden,
      isSafe,
    });
    onClose();
  }

  async function handleDelete() {
    if (!subStash) return;
    if (confirm(`Are you sure you want to delete ${subStash.name}?`)) {
      await removeSubCategory(subStash.id);
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
          <h2 className="text-xl font-bold text-zinc-100">Stash Settings</h2>
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
              <span className="text-xs text-zinc-400 font-medium ml-1">Stash Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Stash Name"
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

          {/* Amount Cap */}
          <label className="block">
            <span className="text-xs text-zinc-400 font-medium ml-1">Amount Cap (optional)</span>
            <div className="relative mt-1">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">
                ₱
              </span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={maxCap ? Number(maxCap).toLocaleString("en-US") : ""}
                onChange={(e) => setMaxCap(e.target.value.replace(/\D/g, ""))}
                placeholder="No limit"
                className="w-full rounded-xl bg-zinc-900 pl-10 pr-4 py-3 text-sm font-bold tabular-nums text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <p className="mt-1.5 text-[10px] text-zinc-500 ml-1">
              Limits how much auto-allocated income goes into this stash.
            </p>
          </label>

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
                  <p className="text-[10px] text-zinc-500">Prevent direct expenses</p>
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
                  <p className="text-[10px] text-zinc-500">Don't count this in main dashboard</p>
                </div>
              </div>
              <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isHidden ? 'bg-rose-500' : 'bg-zinc-700'}`}>
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isHidden ? 'translate-x-4.5' : 'translate-x-1'}`} />
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
