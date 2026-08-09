"use client";

import { useEffect, useState } from "react";
import { BsCheck2, BsPencil } from "react-icons/bs";
import { useApp } from "../lib/store";
import { CATEGORY_ICON_OPTIONS, CategoryIcon } from "./CategoryIcon";

interface AddSubscriptionSheetProps {
  open: boolean;
  onClose: () => void;
}

export function AddSubscriptionSheet({ open, onClose }: AddSubscriptionSheetProps) {
  const { addSubscription } = useApp();
  const [visible, setVisible] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [billingDate, setBillingDate] = useState("");
  const [icon, setIcon] = useState("play");

  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

  useEffect(() => {
    if (open) {
      // Reset form
      setName("");
      setAmount("");
      setBillingCycle("monthly");
      setBillingDate(new Date().toISOString().split("T")[0]);
      setIcon("play");
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      setIsIconPickerOpen(false);
    }
  }, [open]);

  if (!open) return null;

  async function handleSave() {
    if (!name.trim() || !amount || !billingDate) return;

    await addSubscription({
      name: name.trim(),
      amount: parseInt(amount.replace(/\D/g, ""), 10) || 0,
      billingCycle,
      billingDate: new Date(billingDate).toISOString(),
      icon,
    });
    onClose();
  }

  const isValid = name.trim().length > 0 && amount.length > 0 && billingDate.length > 0;

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
          <h2 className="text-xl font-bold text-zinc-100">Add Subscription</h2>
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
              <span className="text-xs text-zinc-400 font-medium ml-1">Service Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Netflix, Spotify..."
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

          {/* Amount */}
          <label className="block">
            <span className="text-xs text-zinc-400 font-medium ml-1">Amount</span>
            <div className="relative mt-1">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">
                ₱
              </span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={amount ? Number(amount).toLocaleString("en-US") : ""}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                placeholder="0"
                className="w-full rounded-xl bg-zinc-900 pl-10 pr-4 py-3 text-sm font-bold tabular-nums text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </label>

          {/* Billing Cycle */}
          <label className="block">
            <span className="text-xs text-zinc-400 font-medium ml-1">Billing Cycle</span>
            <select
              value={billingCycle}
              onChange={(e) => setBillingCycle(e.target.value)}
              className="mt-1 w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500 appearance-none"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </label>

          {/* Billing Date */}
          <label className="block">
            <span className="text-xs text-zinc-400 font-medium ml-1">Next Billing Date</span>
            <input
              type="date"
              value={billingDate}
              onChange={(e) => setBillingDate(e.target.value)}
              className="mt-1 w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500 [color-scheme:dark]"
            />
          </label>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-[48px] flex-1 items-center justify-center rounded-xl bg-zinc-900 text-sm font-bold text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isValid}
            className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 text-sm font-bold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-[0.99] disabled:opacity-50 disabled:active:scale-100"
          >
            Add Subscription
          </button>
        </div>
      </div>
    </div>
  );
}
