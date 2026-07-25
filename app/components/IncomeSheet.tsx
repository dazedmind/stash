"use client";

import { useEffect, useState } from "react";
import { BsPlusLg } from "react-icons/bs";
import { formatCurrency } from "../lib/finance";
import { useApp } from "../lib/store";
import { StashSelectCard } from "./StashSelectCard";

interface IncomeSheetProps {
  open: boolean;
  onClose: () => void;
}

export function IncomeSheet({ open, onClose }: IncomeSheetProps) {
  const { addIncomeAmount, monthlyIncome, categories, allSubcategories } = useApp();
  const [allocationMode, setAllocationMode] = useState<"auto" | "manual">("auto");
  const [selectedSubId, setSelectedSubId] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount(String(monthlyIncome));
      setAllocationMode("auto");
      if (allSubcategories.length > 0) {
        setSelectedSubId(allSubcategories[0].id);
      }
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [open, monthlyIncome, allSubcategories]);

  if (!open) return null;

  const parsedAmount = Number.parseInt(amount.replace(/\D/g, ""), 10) || 0;
  const isValid = parsedAmount > 0 && (allocationMode === "auto" || !!selectedSubId);

  function handleSubmit() {
    if (!isValid) return;
    if (allocationMode === "auto") {
      addIncomeAmount(parsedAmount);
    } else {
      addIncomeAmount(parsedAmount, selectedSubId);
    }
    onClose();
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
        className={`relative w-full max-w-lg rounded-t-3xl bg-zinc-950 p-5 shadow-2xl transition-transform duration-200 ease-out ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="mx-auto mb-4 h-1 w-8 rounded-full bg-zinc-800" />

        <div className="flex items-center gap-2 text-emerald-400">
          <h2 className="text-xl font-semibold text-zinc-100">Add Income</h2>
        </div>

        {/* Allocation Mode Selector */}
        <div className="mt-4 grid grid-cols-2 gap-1.5 rounded-xl bg-zinc-900/60 p-1">
          <button
            type="button"
            onClick={() => setAllocationMode("auto")}
            className={`min-h-[36px] rounded-lg text-xs font-semibold transition-colors ${
              allocationMode === "auto"
                ? "bg-emerald-500 text-zinc-950 font-bold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Auto-Allocate Split
          </button>
          <button
            type="button"
            onClick={() => setAllocationMode("manual")}
            className={`min-h-[36px] rounded-lg text-xs font-semibold transition-colors ${
              allocationMode === "manual"
                ? "bg-emerald-500 text-zinc-950 font-bold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Specific Stash Only
          </button>
        </div>

        {/* Amount Input */}
        <label className="mt-4 block">
          <span className="text-xs text-zinc-400 font-medium">Income Amount</span>
          <div className="relative mt-1.5">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-zinc-500">
              ₱
            </span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={amount.replace(/^0+/, "")}
              placeholder="0"
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
              className="min-h-[52px] w-full rounded-xl bg-zinc-900 pl-10 pr-4 text-2xl font-bold tabular-nums text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </label>

        {/* Manual Target Stash Selector using StashSelectCard */}
        {allocationMode === "manual" && (
          <div className="mt-4">
            <StashSelectCard
              label="Target Sub-stash"
              selectedSubId={selectedSubId}
              categories={categories}
              onSelect={(newSub) => setSelectedSubId(newSub)}
            />
          </div>
        )}

        {/* Breakdown Preview for Auto Mode */}
        {allocationMode === "auto" && (
          <div className="mt-4 rounded-xl bg-zinc-900/60 p-3">
            <span className="text-xs font-medium text-zinc-400">Allocation Breakdown</span>
            <div className="mt-2 space-y-1.5 text-xs">
              {categories.map((cat) => {
                const allocatedShare = Math.round(parsedAmount * (cat.percentage / 100));

                return (
                  <div key={cat.id} className="flex justify-between items-center text-zinc-300">
                    <span>
                      {cat.name} ({cat.percentage}%)
                    </span>
                    <span className="tabular-nums font-mono text-zinc-200">
                      {formatCurrency(allocatedShare)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Positive Button */}
        <button
          type="button"
          disabled={!isValid}
          onClick={handleSubmit}
          className="mt-5 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-sm font-bold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-[0.99] disabled:opacity-30"
        >
          <BsPlusLg className="h-4 w-4" />
          {allocationMode === "auto" ? "Deposit & Auto-Allocate" : "Deposit to Selected Stash"}
        </button>
      </div>
    </div>
  );
}
