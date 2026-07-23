"use client";

import { useEffect, useState } from "react";
import { BsCheckCircleFill, BsCircle, BsCreditCard2Back, BsTrash, BsX } from "react-icons/bs";
import { formatCurrency } from "../lib/finance";

export interface PayLaterInstallmentItem {
  id: string;
  payLaterId: string;
  title: string;
  amount: number;
  dueDate: string;
  isPaid: number;
  paidAt: string | null;
}

export interface PayLaterCardItem {
  id: string;
  name: string;
  totalAmount: number;
  interestRate: number;
  frequency: string;
  dueDate: string;
  paymentType: string;
  months: number;
  monthlyPayment: number;
  installments: PayLaterInstallmentItem[];
}

interface PayLaterDetailModalProps {
  item: PayLaterCardItem | null;
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function PayLaterDetailModal({
  item,
  open,
  onClose,
  onRefresh,
}: PayLaterDetailModalProps) {
  const [installments, setInstallments] = useState<PayLaterInstallmentItem[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open && item) {
      setInstallments(item.installments || []);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [open, item]);

  if (!open || !item) return null;

  const totalAmountWithInterest = Math.round(item.totalAmount * (1 + (item.interestRate || 0) / 100));
  const paidCount = installments.filter((ins) => ins.isPaid === 1).length;
  const totalInstallments = installments.length;
  const paidAmount = installments
    .filter((ins) => ins.isPaid === 1)
    .reduce((acc, ins) => acc + ins.amount, 0);

  const remainingOwed = Math.max(0, totalAmountWithInterest - paidAmount);
  const progressPercent = totalInstallments > 0 ? Math.round((paidCount / totalInstallments) * 100) : 0;

  async function handleTogglePaid(insId: string, currentPaid: number) {
    const nextPaid = currentPaid === 1 ? 0 : 1;

    setInstallments((prev) =>
      prev.map((ins) => (ins.id === insId ? { ...ins, isPaid: nextPaid } : ins))
    );

    setLoadingId(insId);
    try {
      await fetch("/api/pay-later", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ installmentId: insId, isPaid: nextPaid === 1 }),
      });
      onRefresh();
    } catch (err) {
      console.error("Toggle installment error:", err);
    } finally {
      setLoadingId(null);
    }
  }

  async function handleDelete() {
    if (!item) return;
    if (typeof window !== "undefined" && window.confirm(`Delete "${item.name}" and all its records?`)) {
      try {
        await fetch(`/api/pay-later?id=${item.id}`, { method: "DELETE" });
        onRefresh();
        onClose();
      } catch (err) {
        console.error("Delete pay later error:", err);
      }
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close modal"
        className={`absolute inset-0 bg-black/80 transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-t-3xl bg-zinc-950 p-5 shadow-2xl transition-transform duration-200 ease-out ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="mx-auto mb-4 h-1 w-8 rounded-full bg-zinc-800" />

        <header className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-emerald-400 font-bold">
              <BsCreditCard2Back className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">{item.name}</h2>
              <p className="text-xs text-zinc-400 font-medium">
                {item.frequency} • {item.months} {item.months === 1 ? "Payment" : "Installments"}
                {item.interestRate > 0 && ` • ${item.interestRate}% interest`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleDelete}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-zinc-500 hover:text-rose-400 transition-colors"
              title="Delete Card"
            >
              <BsTrash className="h-4 w-4" />
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

        {/* Financial Progress Banner */}
        <div className="mt-4 rounded-2xl bg-zinc-900/60 p-4">
          <div className="flex justify-between items-baseline">
            <div>
              <p className="text-xs text-zinc-500 font-medium">Remaining Owed</p>
              <p className="text-2xl font-bold font-mono text-zinc-100 mt-0.5">
                {formatCurrency(remainingOwed)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500 font-medium">Total Original</p>
              <p className="text-sm font-semibold tabular-nums text-zinc-300">
                {formatCurrency(totalAmountWithInterest)}
              </p>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-[11px] font-semibold text-zinc-400">
              <span>Payment Progress</span>
              <span className="text-emerald-400">{progressPercent}% Paid</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-zinc-950">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* TO-DO List Checkbox Section */}
        <section className="mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Payment Schedule TO-DO List
            </h3>
            <span className="text-xs font-medium text-emerald-400 font-mono">
              {paidCount} of {totalInstallments} completed
            </span>
          </div>

          <div className="mt-3 space-y-2">
            {installments.length === 0 ? (
              <p className="py-4 text-center text-xs text-zinc-500">No installments generated</p>
            ) : (
              installments.map((ins) => {
                const isPaid = ins.isPaid === 1;

                return (
                  <div
                    key={ins.id}
                    onClick={() => handleTogglePaid(ins.id, ins.isPaid)}
                    className={`flex cursor-pointer items-center justify-between rounded-xl p-3.5 transition-all ${
                      isPaid
                        ? "bg-zinc-900/30 opacity-75"
                        : "bg-zinc-900/70 hover:bg-zinc-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={loadingId === ins.id}
                        className="text-lg text-emerald-400"
                      >
                        {isPaid ? (
                          <BsCheckCircleFill className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <BsCircle className="h-5 w-5 text-zinc-600 hover:text-emerald-400 transition-colors" />
                        )}
                      </button>
                      <div>
                        <p
                          className={`text-xs font-semibold ${
                            isPaid ? "line-through text-zinc-500" : "text-zinc-100"
                          }`}
                        >
                          {ins.title}
                        </p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                          Due {ins.dueDate} {isPaid && "• Paid ✓"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-sm font-bold font-mono ${
                          isPaid ? "line-through text-zinc-500" : "text-emerald-400"
                        }`}
                      >
                        {formatCurrency(ins.amount)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
