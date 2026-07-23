"use client";

import { useEffect, useState } from "react";
import { BsArrowLeftRight, BsDashLg, BsPlusLg, BsX } from "react-icons/bs";
import { formatCurrency } from "../lib/finance";

interface TransactionLog {
  id: string;
  type: "income" | "expense" | "transfer_internal" | "transfer_sub";
  amount: number;
  source: string | null;
  description: string | null;
  subCategoryName: string | null;
  breakdown: Record<string, number> | null;
  createdAt: string;
}

interface TransactionHistoryModalProps {
  open: boolean;
  onClose: () => void;
}

export function TransactionHistoryModal({ open, onClose }: TransactionHistoryModalProps) {
  const [transactions, setTransactions] = useState<TransactionLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      requestAnimationFrame(() => setVisible(true));
      fetch("/api/finance/transactions")
        .then((res) => res.json())
        .then((data) => {
          if (data.transactions) {
            setTransactions(data.transactions);
          }
        })
        .catch((err) => console.error("History fetch error:", err))
        .finally(() => setLoading(false));
    } else {
      setVisible(false);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close history"
        className={`absolute inset-0 bg-black/70 transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-t-3xl bg-zinc-950 p-5 shadow-2xl transition-transform duration-200 ease-out ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="mx-auto mb-4 h-1 w-8 rounded-full bg-zinc-800" />

        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-100">Transaction History</h2>
            <p className="mt-0.5 text-xs text-zinc-400">Activity & allocation logs</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 hover:text-zinc-100"
          >
            <BsX className="h-5 w-5" />
          </button>
        </header>

        <div className="mt-4 space-y-3">
          {loading ? (
            <div className="py-8 text-center text-xs text-zinc-500">Loading history…</div>
          ) : transactions.length === 0 ? (
            <div className="rounded-2xl bg-zinc-900/40 p-6 text-center text-xs text-zinc-500">
              No transactions recorded yet.
            </div>
          ) : (
            transactions.map((tx) => {
              const isIncome = tx.type === "income";
              const isExpense = tx.type === "expense";
              const dateStr = new Date(tx.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={tx.id}
                  className="rounded-2xl bg-zinc-900/40 p-4 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full font-bold ${
                          isIncome
                            ? "bg-emerald-500/10 text-emerald-400"
                            : isExpense
                              ? "bg-rose-500/10 text-rose-400"
                              : "bg-zinc-800 text-zinc-300"
                        }`}
                      >
                        {isIncome ? (
                          <BsPlusLg className="h-4 w-4" />
                        ) : isExpense ? (
                          <BsDashLg className="h-4 w-4" />
                        ) : (
                          <BsArrowLeftRight className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-zinc-100">
                          {isIncome
                            ? "Income Deposit"
                            : isExpense
                              ? `Expense: ${tx.subCategoryName || "Stash"}`
                              : `Transfer: ${tx.description || "Stash Transfer"}`}
                        </p>
                        <p className="text-[11px] text-zinc-400">{dateStr}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-base font-bold tabular-nums ${
                          isIncome
                            ? "text-emerald-400"
                            : isExpense
                              ? "text-rose-400"
                              : "text-zinc-200"
                        }`}
                      >
                        {isIncome ? "+" : isExpense ? "-" : ""}
                        {formatCurrency(tx.amount)}
                      </p>
                    </div>
                  </div>

                  {/* Note display for Expense / Description */}
                  {isExpense && tx.description && (
                    <div className="mt-2 text-xs text-zinc-400 font-medium">
                      <span className="text-zinc-200">{tx.description}</span>
                    </div>
                  )}

                  {/* Income per-category allocation breakdown display */}
                  {isIncome && tx.breakdown && Object.keys(tx.breakdown).length > 0 && (
                    <div className="mt-3 border-t border-zinc-800/40 pt-2.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                        Allocated per budget category:
                      </span>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {Object.entries(tx.breakdown).map(([catName, allocatedAmt]) => (
                          <span
                            key={catName}
                            className="inline-flex items-center gap-1 rounded-lg bg-zinc-950 px-2 py-0.5 text-xs text-zinc-300"
                          >
                            <span className="font-medium">{catName}:</span>
                            <span className="font-mono text-emerald-400">
                              +{formatCurrency(allocatedAmt)}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
