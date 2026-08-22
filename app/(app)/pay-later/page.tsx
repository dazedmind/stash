"use client";

import { useCallback, useEffect, useState } from "react";
import { BsCheckLg, BsChevronDown, BsClockHistory, BsCreditCard2Back, BsPlusLg } from "react-icons/bs";
import Link from "next/link";
import { AddPayLaterModal } from "../../components/AddPayLaterModal";
import { PayLaterCardItem, PayLaterDetailModal } from "../../components/PayLaterDetailModal";
import { TransactionHistoryModal } from "../../components/TransactionHistoryModal";
import { formatCurrency } from "../../lib/finance";

export default function PayLaterPage() {
  const [payLaters, setPayLaters] = useState<PayLaterCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PayLaterCardItem | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [isPaidCollapsed, setIsPaidCollapsed] = useState(true); // Default collapsed for cleaner UI

  const fetchPayLaters = useCallback(async () => {
    try {
      const res = await fetch("/api/pay-later");
      if (res.ok) {
        const data = await res.json();
        if (data.payLaters) {
          setPayLaters(data.payLaters);
          // If modal is currently open for a specific item, update its state
          setSelectedItem((current) => {
            if (!current) return null;
            return data.payLaters.find((p: PayLaterCardItem) => p.id === current.id) || null;
          });
        }
      }
    } catch (err) {
      console.error("Fetch pay laters error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayLaters();
  }, [fetchPayLaters]);

  function checkIsFullyPaid(item: PayLaterCardItem) {
    const totalWithInterest = Math.round(item.totalAmount * (1 + (item.interestRate || 0) / 100));
    const paidAmount = item.installments
      .filter((ins) => ins.isPaid === 1)
      .reduce((acc, ins) => acc + ins.amount, 0);
    const remaining = Math.max(0, totalWithInterest - paidAmount);
    return remaining === 0 && item.installments.length > 0;
  }

  const activePayLaters = payLaters.filter((item) => !checkIsFullyPaid(item));
  const paidPayLaters = payLaters.filter((item) => checkIsFullyPaid(item));

  const totalOwed = activePayLaters.reduce((sum, item) => {
    const totalWithInterest = Math.round(item.totalAmount * (1 + (item.interestRate || 0) / 100));
    const paidAmount = item.installments
      .filter((ins) => ins.isPaid === 1)
      .reduce((acc, ins) => acc + ins.amount, 0);
    return sum + Math.max(0, totalWithInterest - paidAmount);
  }, 0);

  const totalMonthlyRepayments = activePayLaters.reduce((sum, item) => {
    const hasUnpaid = item.installments.some((ins) => ins.isPaid === 0);
    return hasUnpaid ? sum + item.monthlyPayment : sum;
  }, 0);

  return (
    <>
      <div className="animate-fade-in space-y-4 px-4 py-4">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              LIABILITIES
            </span>
            <h1 className="text-xl font-bold tracking-tight text-zinc-100">Pay Later</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="flex min-h-[36px] items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 text-xs font-bold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-95 shadow-xs"
            >
              <BsPlusLg className="h-3.5 w-3.5" />
              Add Debt
            </button>
          </div>
        </header>

        {/* Financial Summary */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-zinc-900/60 p-4">
            <p className="text-xs text-zinc-500 font-medium">Total Owed</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-zinc-400">
              {formatCurrency(totalOwed)}
            </p>
          </div>
          <div className="rounded-2xl bg-zinc-900/60 p-4">
            <p className="text-xs text-zinc-500 font-medium">Payment Next Due</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-zinc-100">
              {formatCurrency(totalMonthlyRepayments)}
            </p>
          </div>
        </div>

        {/* Subscriptions Link */}
        <div className="mt-2">
          <Link
            href="/pay-later/subscriptions"
            className="flex items-center justify-between rounded-2xl bg-zinc-900/40 px-4 py-3.5 transition-all hover:bg-zinc-900/60 active:scale-[0.99] border border-zinc-800/30"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-zinc-100">Subscriptions</span>
            </div>
            <BsChevronDown className="h-4 w-4 -rotate-90 text-zinc-400" />
          </Link>
        </div>

        {/* Active Cards List */}
        <section className="space-y-3">
          {/* <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-200">Active Commitments</h2>
            <span className="text-xs text-zinc-500">{activePayLaters.length} items</span>
          </div> */}

          {loading ? (
            <div className="py-8 text-center text-xs text-zinc-500">Loading Pay Later items…</div>
          ) : activePayLaters.length === 0 ? (
            <div className="rounded-2xl bg-zinc-900/40 p-6 text-center">
              <BsCreditCard2Back className="mx-auto h-7 w-7 text-zinc-600" />
              <p className="mt-2 font-semibold text-xs text-zinc-300">No active Pay Later cards</p>
              <p className="mt-1 text-[11px] text-zinc-500">
                Track your credit cards, Shopee PayLater, or installment debts.
              </p>
              <button
                type="button"
                onClick={() => setAddModalOpen(true)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-zinc-950 hover:bg-emerald-400"
              >
                <BsPlusLg className="h-3.5 w-3.5" /> Add Pay Later
              </button>
            </div>
          ) : (
            activePayLaters.map((item) => {
              const totalWithInterest = Math.round(item.totalAmount * (1 + (item.interestRate || 0) / 100));
              const paidCount = item.installments.filter((ins) => ins.isPaid === 1).length;
              const totalCount = item.installments.length;
              const paidAmount = item.installments
                .filter((ins) => ins.isPaid === 1)
                .reduce((acc, ins) => acc + ins.amount, 0);

              const remaining = Math.max(0, totalWithInterest - paidAmount);
              const progressPct = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;

              return (
                <article
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="group cursor-pointer rounded-2xl bg-zinc-900/60 p-4 transition-all duration-200 hover:bg-zinc-900 active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-950 font-bold text-emerald-400">
                        <BsCreditCard2Back className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold text-base text-zinc-100">
                          {item.name}
                        </h3>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-400">
                          <span>{item.frequency}</span>
                          <span>•</span>
                          <span>
                            {item.months} {item.months === 1 ? "Payment" : "Months"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-base font-bold tabular-nums text-rose-400">
                        {formatCurrency(remaining)}
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        {formatCurrency(item.monthlyPayment)} / {item.frequency === "Weekly" ? "wk" : "mo"}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3.5 pt-3 border-t border-zinc-800/40">
                    <div className="flex items-center justify-between text-[11px] font-medium text-zinc-400">
                      <span>Payment Progress</span>
                      <span className="text-zinc-400 font-mono">
                        {paidCount} / {totalCount} paid
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-950">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </article>
              );
            })
          )}

          {/* Collapsible Paid Section (Default Collapsed) */}
          {paidPayLaters.length > 0 && (
            <div className="pt-3 space-y-3">
              <button
                type="button"
                onClick={() => setIsPaidCollapsed(!isPaidCollapsed)}
                className="flex w-full items-center justify-between rounded-xl bg-zinc-900/40 px-4 py-3 text-xs font-bold text-zinc-400 hover:text-zinc-200 transition-colors border border-zinc-800/30"
              >
                <div className="flex items-center gap-2">
                  <span>Paid ({paidPayLaters.length})</span>
                </div>
                <BsChevronDown
                  className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${
                    isPaidCollapsed ? "" : "rotate-180"
                  }`}
                />
              </button>

              {!isPaidCollapsed && (
                <div className="space-y-3 animate-fade-in">
                  {paidPayLaters.map((item) => {
                    const paidCount = item.installments.length;

                    return (
                      <article
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className="group cursor-pointer rounded-2xl bg-zinc-900/30 p-4 transition-all duration-200 hover:bg-zinc-900/60 active:scale-[0.99] border border-zinc-800/20"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 font-bold">
                              <BsCheckLg className="h-5 w-5" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="truncate font-semibold text-base text-zinc-400 line-through">
                                  {item.name}
                                </h3>
                                <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                                  PAID
                                </span>
                              </div>
                              <p className="text-xs text-zinc-500 mt-0.5">
                                {paidCount} payments completed
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-base font-bold tabular-nums text-zinc-500 line-through">
                              ₱0
                            </p>
                            <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                              Fully Settled
                            </p>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      <AddPayLaterModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={fetchPayLaters}
      />

      <PayLaterDetailModal
        item={selectedItem}
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onRefresh={fetchPayLaters}
      />

      <TransactionHistoryModal open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </>
  );
}
