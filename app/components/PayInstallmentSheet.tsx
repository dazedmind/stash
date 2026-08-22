"use client";

import { useEffect, useState } from "react";
import { BsCheckCircle, BsWallet2 } from "react-icons/bs";
import { formatCurrency } from "../lib/finance";
import { useApp } from "../lib/store";
import { StashSelectCard } from "./StashSelectCard";
import type { PayLaterInstallmentItem } from "./PayLaterDetailModal";

interface PayInstallmentSheetProps {
  open: boolean;
  installment: PayLaterInstallmentItem | null;
  onClose: () => void;
  onPayWithDeduction: (installmentId: string, subCategoryId: string) => Promise<void>;
  onPayWithoutDeduction: (installmentId: string) => Promise<void>;
}

export function PayInstallmentSheet({
  open,
  installment,
  onClose,
  onPayWithDeduction,
  onPayWithoutDeduction,
}: PayInstallmentSheetProps) {
  const { categories } = useApp();
  const [visible, setVisible] = useState(false);
  const [selectedSubId, setSelectedSubId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && installment) {
      // Pre-select saved overflow stash if available
      const saved = typeof window !== "undefined" ? localStorage.getItem("global_overflow_sub_id") || "" : "";
      setSelectedSubId(saved);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [open, installment]);

  if (!open || !installment) return null;

  async function handlePayWithDeduction() {
    if (!selectedSubId || !installment) return;
    setIsLoading(true);
    try {
      await onPayWithDeduction(installment.id, selectedSubId);
      onClose();
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePayWithoutDeduction() {
    if (!installment) return;
    setIsLoading(true);
    try {
      await onPayWithoutDeduction(installment.id);
      onClose();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close"
        className={`absolute inset-0 bg-black/80 transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-lg rounded-t-3xl bg-zinc-950 p-5 shadow-2xl transition-transform duration-200 ease-out ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="mx-auto mb-4 h-1 w-8 rounded-full bg-zinc-800" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
            <BsCheckCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-100">{installment.title}</h2>
            <p className="text-xs text-zinc-400 font-mono font-bold text-emerald-400">
              {formatCurrency(installment.amount)}
            </p>
          </div>
        </div>

        <div className="h-px bg-zinc-800/50 mb-5" />

        {/* Stash Selector */}
        <div className="mb-1">
          <StashSelectCard
            label="Deduct from Stash"
            selectedSubId={selectedSubId}
            categories={categories}
            onSelect={setSelectedSubId}
            dropUp
          />
        </div>

        <p className="mt-2 text-[11px] text-zinc-500 mb-5">
          This will automatically record an expense transaction from the selected stash.
        </p>

        {/* Actions */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handlePayWithDeduction}
            disabled={!selectedSubId || isLoading}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-sm font-bold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-[0.99] disabled:opacity-40 disabled:active:scale-100"
          >
            <BsCheckCircle className="h-4 w-4" />
            Pay & Deduct from Stash
          </button>

          <button
            type="button"
            onClick={handlePayWithoutDeduction}
            disabled={isLoading}
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 text-sm font-semibold text-zinc-300 transition-all hover:bg-zinc-800 active:scale-[0.99] disabled:opacity-40"
          >
            <BsWallet2 className="h-4 w-4 text-zinc-500" />
            Mark as Paid (No Deduction)
          </button>
        </div>
      </div>
    </div>
  );
}
