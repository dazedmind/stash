"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BsX } from "react-icons/bs";
import { ExpenseRecordCard, type TransactionRecord } from "./ExpenseRecordCard";

interface TransactionHistoryModalProps {
  open: boolean;
  onClose: () => void;
}

export function TransactionHistoryModal({ open, onClose }: TransactionHistoryModalProps) {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
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
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                typeFilter === tab.id
                  ? "bg-zinc-800 text-zinc-100 font-bold border border-zinc-700 shadow-xs"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800/40"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {typeFilter === "expense" && (
          <div className="mt-2.5 flex items-center justify-between rounded-xl bg-zinc-900/60 px-3 py-2 border border-zinc-800/50">
            <span className="text-[11px] text-zinc-400">Looking for detailed breakdown?</span>
            <Link
              href="/expenses"
              onClick={onClose}
              className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              See all expense page →
            </Link>
          </div>
        )}

        <div className="mt-4 space-y-3">
          {loading ? (
            <div className="py-8 text-center text-xs text-zinc-500">Loading history…</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="rounded-2xl bg-zinc-900/40 p-6 text-center text-xs text-zinc-500">
              No {typeFilter !== "all" ? typeFilter : ""} transactions recorded yet.
            </div>
          ) : (
            (() => {
              let lastDateHeader = "";

              return filteredTransactions.map((tx) => {
                const txDate = new Date(tx.createdAt);
                const dateHeaderStr = txDate.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                });

                let showHeader = false;
                if (dateHeaderStr !== lastDateHeader) {
                  showHeader = true;
                  lastDateHeader = dateHeaderStr;
                }

                return (
                  <div key={tx.id}>
                    {showHeader && (
                      <h3 className="sticky top-0 z-10 bg-zinc-950/95 py-2 text-sm font-bold text-zinc-300 backdrop-blur-md mb-2">
                        {dateHeaderStr}
                      </h3>
                    )}
                    <ExpenseRecordCard transaction={tx} className="mb-3" />
                  </div>
                );
              });
            })()
          )}
        </div>
      </div>
    </div>
  );
}
