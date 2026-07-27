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
  const [typeFilter, setTypeFilter] = useState<"all" | "expense" | "income" | "transfers">("all");

  useEffect(() => {
    if (open) {
      setLoading(true);
      setTypeFilter("all");
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

  const filteredTransactions = transactions.filter((tx) => {
    if (typeFilter === "expense") return tx.type === "expense";
    if (typeFilter === "income") return tx.type === "income";
    if (typeFilter === "transfers")
      return tx.type === "transfer_internal" || tx.type === "transfer_sub";
    return true;
  });

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

        {/* Type Filter Buttons Bar */}
        <div className="mt-3.5 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "all", label: "All" },
            { id: "expense", label: "Expense" },
            { id: "income", label: "Income" },
            { id: "transfers", label: "Transfers" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTypeFilter(tab.id as any)}
              className={`shrink-0 min-h-[32px] rounded-xl px-3.5 text-xs font-semibold transition-all ${
                typeFilter === tab.id
                  ? "bg-emerald-500 text-zinc-950 font-bold shadow-xs"
                  : "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {loading ? (
            <div className="py-8 text-center text-xs text-zinc-500">Loading history…</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="rounded-2xl bg-zinc-900/40 p-6 text-center text-xs text-zinc-500">
              No {typeFilter !== "all" ? typeFilter : ""} transactions recorded yet.
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const isIncome = tx.type === "income";
              const isExpense = tx.type === "expense";
              const isInternalTransfer = tx.type === "transfer_internal";
              const isSubTransfer = tx.type === "transfer_sub";

              const dateStr = new Date(tx.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              const isToCashInternal =
                tx.source === "digital_to_cash" || tx.description?.toLowerCase().includes("to cash");
              const isDigitalSource = tx.source === "digital" || tx.source === "digital_to_cash";

              const renderTitle = () => {
                if (isIncome) return "Income Deposit";
                if (isExpense) return `Expense: ${tx.subCategoryName || "Stash"}`;
                if (isSubTransfer && tx.description && tx.description.includes(" to ")) {
                  const parts = tx.description.split(" to ");
                  return (
                    <span>
                      <strong className="font-bold text-zinc-100">{parts[0]}</strong>{" "}
                      <span className="font-normal text-zinc-400 text-xs">to</span>{" "}
                      <strong className="font-bold text-zinc-100">{parts[1]}</strong>
                    </span>
                  );
                }
                return tx.description || "Stash Transfer";
              };

              return (
                <div
                  key={tx.id}
                  className="rounded-2xl bg-zinc-900/40 p-4 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div
                        className={`flex shrink-0 h-9 w-9 items-center justify-center rounded-full font-bold mt-0.5 ${
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
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="font-semibold text-sm text-zinc-100 leading-snug">
                          {renderTitle()}
                        </p>

                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Direction Pill Badges */}
                          {isInternalTransfer && (
                            <div className="inline-flex items-center gap-1">
                              {isToCashInternal ? (
                                <>
                                  <span className="text-[10px] font-bold rounded-full px-2 py-0.5 text-green-300 bg-green-300/10">
                                    Digital
                                  </span>
                                  <span className="text-xs text-zinc-400 font-bold">→</span>
                                  <span className="text-[10px] font-bold rounded-full px-2 py-0.5 text-[#ffff64] bg-[#ffff64]/10">
                                    Cash
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="text-[10px] font-bold rounded-full px-2 py-0.5 text-[#ffff64] bg-[#ffff64]/10">
                                    Cash
                                  </span>
                                  <span className="text-xs text-zinc-400 font-bold">→</span>
                                  <span className="text-[10px] font-bold rounded-full px-2 py-0.5 text-green-300 bg-green-300/10">
                                    Digital
                                  </span>
                                </>
                              )}
                            </div>
                          )}

                          {(isSubTransfer || isExpense) && (
                            <span
                              className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${
                                isDigitalSource
                                  ? "text-green-300 bg-green-300/10"
                                  : "text-[#ffff64] bg-[#ffff64]/10"
                              }`}
                            >
                              {isDigitalSource ? "Digital" : "Cash"}
                            </span>
                          )}

                          <span className="text-[11px] text-zinc-400">{dateStr}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
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

                  {/* Note display for Expense */}
                  {isExpense && tx.description && (
                    <div className="mt-2 text-xs text-zinc-400 font-medium pl-12">
                      <span className="text-zinc-300">{tx.description}</span>
                    </div>
                  )}

                  {/* Income per-category allocation breakdown display */}
                  {isIncome && tx.breakdown && Object.keys(tx.breakdown).length > 0 && (
                    <div className="mt-3 border-t border-zinc-800/40 pt-2.5 pl-12">
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
