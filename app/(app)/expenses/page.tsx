"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BsArrowLeft,
  BsCash,
  BsCreditCard,
  BsDashLg,
  BsFilter,
  BsPlusLg,
  BsSearch,
  BsTag,
  BsWallet2,
} from "react-icons/bs";
import { ExpenseRecordCard } from "../../components/ExpenseRecordCard";
import { ExpenseSheet } from "../../components/ExpenseSheet";
import { EXPENSE_TAGS, getExpenseTag } from "../../lib/expenseTags";
import { formatCurrency } from "../../lib/finance";

interface ExpenseLogItem {
  id: string;
  amount: number;
  source: string | null;
  tag: string | null;
  description: string | null;
  subCategoryName: string | null;
  createdAt: string;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expenseSheetOpen, setExpenseSheetOpen] = useState(false);

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/finance/transactions?limit=100");
      const data = await res.json();
      if (data.transactions) {
        const onlyExpenses = data.transactions.filter(
          (t: any) => t.type === "expense"
        );
        setExpenses(onlyExpenses);
      }
    } catch (err) {
      console.error("Fetch expenses error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Compute month total and all-time total
  const { thisMonthSpent, totalSpent } = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let monthSum = 0;
    let totalSum = 0;

    expenses.forEach((item) => {
      totalSum += item.amount;
      const d = new Date(item.createdAt);
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        monthSum += item.amount;
      }
    });

    return { thisMonthSpent: monthSum, totalSpent: totalSum };
  }, [expenses]);

  // Filtered expense records
  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      // Tag filter
      if (selectedTagFilter !== "all") {
        const itemTag = item.tag?.toLowerCase() || "other";
        if (itemTag !== selectedTagFilter) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const noteMatch = item.description?.toLowerCase().includes(query);
        const stashMatch = item.subCategoryName?.toLowerCase().includes(query);
        const tagObj = getExpenseTag(item.tag);
        const tagMatch = tagObj.label.toLowerCase().includes(query);
        if (!noteMatch && !stashMatch && !tagMatch) return false;
      }

      return true;
    });
  }, [expenses, selectedTagFilter, searchQuery]);

  // Group by date header
  const groupedExpenses = useMemo(() => {
    const groups: { dateHeader: string; items: ExpenseLogItem[] }[] = [];
    const map = new Map<string, ExpenseLogItem[]>();

    filteredExpenses.forEach((item) => {
      const d = new Date(item.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      let dateHeader = d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });

      if (d.toDateString() === today.toDateString()) {
        dateHeader = "Today";
      } else if (d.toDateString() === yesterday.toDateString()) {
        dateHeader = "Yesterday";
      }

      if (!map.has(dateHeader)) {
        map.set(dateHeader, []);
        groups.push({ dateHeader, items: map.get(dateHeader)! });
      }
      map.get(dateHeader)!.push(item);
    });

    return groups;
  }, [filteredExpenses]);

  return (
    <>
      <div className="animate-fade-in space-y-4 px-4 py-4">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
            >
              <BsArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                EXPENSES
              </span>
              <h1 className="text-xl font-bold tracking-tight text-zinc-100">
                All Expenses
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setExpenseSheetOpen(true)}
            className="flex min-h-[36px] items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 text-xs font-bold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-95 shadow-xs"
          >
            <BsPlusLg className="h-3.5 w-3.5" />
            Add Expense
          </button>
        </header>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-zinc-900/60 p-4 border border-zinc-800/30">
            <p className="text-xs text-zinc-400 font-medium">This Month</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-zinc-100">
              {formatCurrency(thisMonthSpent)}
            </p>
            <p className="mt-1 text-[10px] text-zinc-500 font-medium">
              Current calendar month
            </p>
          </div>
          <div className="rounded-2xl bg-zinc-900/60 p-4 border border-zinc-800/30">
            <p className="text-xs text-zinc-400 font-medium">Total Tracked</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-zinc-100">
              {formatCurrency(totalSpent)}
            </p>
            <p className="mt-1 text-[10px] text-zinc-500 font-medium">
              {expenses.length} expense record{expenses.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <BsSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 h-3.5 w-3.5" />
          <input
            type="text"
            placeholder="Search note, stash, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="min-h-[42px] w-full rounded-xl bg-zinc-900/80 pl-9 pr-3 text-xs text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500/50 border border-zinc-800/40 placeholder:text-zinc-500"
          />
        </div>

        {/* Tag Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedTagFilter("all")}
            className={`min-h-[32px] shrink-0 rounded-xl px-3 text-xs font-semibold transition-all ${
              selectedTagFilter === "all"
                ? "bg-emerald-500 text-zinc-950 font-bold shadow-xs"
                : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800/40"
            }`}
          >
            All Tags ({expenses.length})
          </button>
          {EXPENSE_TAGS.map((tag) => {
            const Icon = tag.icon;
            const isSelected = selectedTagFilter === tag.id;
            const count = expenses.filter(
              (e) => (e.tag?.toLowerCase() || "other") === tag.id
            ).length;

            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => setSelectedTagFilter(tag.id)}
                className={`flex min-h-[32px] shrink-0 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition-all ${
                  isSelected
                    ? `${tag.bgBadge} ${tag.borderBadge} border font-bold shadow-xs scale-[1.02]`
                    : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800/40"
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 ${
                    isSelected ? tag.color : "text-zinc-500"
                  }`}
                />
                <span>{tag.label}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isSelected ? "bg-zinc-950/20 text-zinc-950 font-bold" : "text-zinc-500"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Expense Log List */}
        <section className="space-y-4">
          {loading ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              Loading expense logs...
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="rounded-2xl bg-zinc-900/40 p-8 text-center border border-zinc-800/30">
              <BsTag className="mx-auto h-8 w-8 text-zinc-600" />
              <p className="mt-2 font-semibold text-xs text-zinc-300">
                No expenses found
              </p>
              <p className="mt-1 text-[11px] text-zinc-500">
                {selectedTagFilter !== "all" || searchQuery
                  ? "Try adjusting your filters or search."
                  : "Subtract your first expense to begin tracking."}
              </p>
              <button
                type="button"
                onClick={() => setExpenseSheetOpen(true)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-zinc-950 hover:bg-emerald-400"
              >
                <BsPlusLg className="h-3.5 w-3.5" /> Add Expense
              </button>
            </div>
          ) : (
            groupedExpenses.map((group) => {
              const groupTotal = group.items.reduce(
                (sum, item) => sum + item.amount,
                0
              );

              return (
                <div key={group.dateHeader} className="space-y-2">
                  <div className="flex items-center justify-between px-1 text-xs">
                    <span className="font-bold text-zinc-400">
                      {group.dateHeader}
                    </span>
                    <span className="font-semibold tabular-nums text-zinc-400 text-[11px]">
                      -{formatCurrency(groupTotal)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {group.items.map((item) => (
                      <ExpenseRecordCard
                        key={item.id}
                        transaction={{ ...item, type: "expense" }}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>

      <ExpenseSheet
        open={expenseSheetOpen}
        onClose={() => {
          setExpenseSheetOpen(false);
          fetchExpenses();
        }}
      />
    </>
  );
}
