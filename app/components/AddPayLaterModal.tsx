"use client";

import { useState } from "react";
import { BsCalendarEvent, BsCheckLg, BsCreditCard2Back, BsPlusLg, BsX } from "react-icons/bs";
import { formatCurrency } from "../lib/finance";

interface AddPayLaterModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddPayLaterModal({ open, onClose, onSuccess }: AddPayLaterModalProps) {
  const [name, setName] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [interestRate, setInterestRate] = useState("0");
  const [frequency, setFrequency] = useState("Monthly");
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [paymentType, setPaymentType] = useState<"one_time" | "installment">("installment");
  const [months, setMonths] = useState(3);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const parsedTotal = Number.parseInt(totalAmount.replace(/\D/g, ""), 10) || 0;
  const parsedRate = Number.parseFloat(interestRate) || 0;
  const isOneTime = paymentType === "one_time";
  const effectiveMonths = isOneTime ? 1 : Math.max(1, months);

  const totalWithInterest = Math.round(parsedTotal * (1 + parsedRate / 100));
  const autoCalculatedRepayment = Math.round(totalWithInterest / effectiveMonths);

  const isValid = name.trim().length > 0 && parsedTotal > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/pay-later", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          totalAmount: parsedTotal,
          interestRate: parsedRate,
          frequency,
          dueDate,
          paymentType,
          months: effectiveMonths,
        }),
      });

      if (res.ok) {
        setName("");
        setTotalAmount("");
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error("Create pay later error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/80 backdrop-blur-xs"
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-t-3xl bg-zinc-950 p-5 shadow-2xl animate-fade-in"
        style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="mx-auto mb-4 h-1 w-8 rounded-full bg-zinc-800" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BsCreditCard2Back className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-zinc-100">Add Pay Later / Card Debt</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 hover:text-zinc-100"
          >
            <BsX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Card / Debt Name */}
          <div>
            <span className="text-xs text-zinc-400 font-medium">Card or Provider Name</span>
            <input
              type="text"
              required
              placeholder="e.g. BDO Visa Credit Card, Shopee PayLater"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 min-h-[44px] w-full rounded-xl bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Total Amount Due */}
          <div>
            <span className="text-xs text-zinc-400 font-medium">Total Amount Due</span>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-zinc-500">
                ₱
              </span>
              <input
                type="text"
                inputMode="numeric"
                required
                placeholder="0"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value.replace(/\D/g, ""))}
                className="min-h-[52px] w-full rounded-xl bg-zinc-900 pl-10 pr-4 text-2xl font-bold tabular-nums text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Payment Structure (One-Time vs Installment) */}
          <div>
            <span className="text-xs text-zinc-400 font-medium">Payment Type</span>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentType("installment")}
                className={`min-h-[40px] rounded-xl text-xs font-semibold transition-colors ${
                  paymentType === "installment"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Multi-month Installment
              </button>
              <button
                type="button"
                onClick={() => setPaymentType("one_time")}
                className={`min-h-[40px] rounded-xl text-xs font-semibold transition-colors ${
                  paymentType === "one_time"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                One-Time Payment
              </button>
            </div>
          </div>

          {/* Installment Months selector (Shopee PayLater style) */}
          {paymentType === "installment" && (
            <div>
              <span className="text-xs text-zinc-400 font-medium">Installment Duration</span>
              <div className="mt-1.5 grid grid-cols-4 gap-2">
                {[1, 3, 6, 12].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMonths(m)}
                    className={`min-h-[38px] rounded-xl text-xs font-semibold transition-colors ${
                      months === m
                        ? "bg-emerald-500 text-zinc-950"
                        : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                    }`}
                  >
                    {m} {m === 1 ? "Month" : "Months"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Frequency & Interest */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-xs text-zinc-400 font-medium">Repayment Frequency</span>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="mt-1.5 min-h-[44px] w-full rounded-xl bg-zinc-900 px-3 text-xs font-medium text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Monthly">Monthly</option>
                <option value="Bi-weekly">Bi-weekly</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>

            <div>
              <span className="text-xs text-zinc-400 font-medium">Interest Rate % (optional)</span>
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder="0"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="mt-1.5 min-h-[44px] w-full rounded-xl bg-zinc-900 px-3 text-xs font-mono font-bold text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Due Date */}
          <div>
            <span className="text-xs text-zinc-400 font-medium">First Due Date</span>
            <div className="relative mt-1.5">
              <BsCalendarEvent className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="min-h-[44px] w-full rounded-xl bg-zinc-900 pl-10 pr-3 text-xs font-medium text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Auto Calculated Preview Card */}
          {parsedTotal > 0 && (
            <div className="rounded-xl bg-zinc-900/80 p-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-medium">Auto-Calculated Repayment:</span>
                <span className="font-bold text-base font-mono text-emerald-400">
                  {formatCurrency(autoCalculatedRepayment)} / {frequency === "Weekly" ? "week" : frequency === "Bi-weekly" ? "2 weeks" : "month"}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-zinc-500">
                {isOneTime
                  ? `Single payment of ${formatCurrency(totalWithInterest)} due on ${dueDate}`
                  : `Generates ${effectiveMonths} installment checklists averaging ${formatCurrency(autoCalculatedRepayment)}`}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={!isValid || loading}
            className="mt-2 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-sm font-bold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-[0.99] disabled:opacity-30"
          >
            <BsCheckLg className="h-4 w-4" />
            {loading ? "Creating..." : "Save Pay Later Item"}
          </button>
        </form>
      </div>
    </div>
  );
}
