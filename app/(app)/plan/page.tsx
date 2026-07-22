"use client";

import { useState } from "react";
import { BsPencil } from "react-icons/bs";
import { EditAllocationModal } from "../../components/EditAllocationModal";
import { formatCurrency } from "../../lib/finance";
import { useApp } from "../../lib/store";

export default function PlanPage() {
  const { monthlyIncome, allocationTotals, categories, setMonthlyIncome } = useApp();
  const [editAllocOpen, setEditAllocOpen] = useState(false);

  return (
    <>
      <div className="animate-fade-in space-y-4 px-4 py-4">
        <header className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              PLAN
            </span>
            <h1 className="text-xl font-bold tracking-tight text-zinc-100">Allocation Plan</h1>
          </div>
          <button
            type="button"
            onClick={() => setEditAllocOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <BsPencil className="h-3 w-3" />
            Edit Rules
          </button>
        </header>

        {/* Allocation Split Overview */}
        <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
            <span>Rules</span>
            <span>Split %</span>
          </div>

          <div className="mt-3 space-y-3">
            {categories.map((cat) => (
              <div key={cat.id} className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-200">{cat.name}</span>
                  <span className="font-semibold text-zinc-300">{cat.percentage}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full bg-zinc-200 rounded-full transition-all duration-300"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
                  <span>{cat.subcategories.length} stashes</span>
                  <span className="tabular-nums font-mono text-zinc-300">
                    {formatCurrency(allocationTotals[cat.tag])}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Monthly Income Target */}
        <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4">
          <span className="text-xs text-zinc-400 font-medium">Expected Monthly Income</span>

          <label className="mt-2.5 block">
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                ₱
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={monthlyIncome.toLocaleString()}
                onChange={(e) => {
                  const val = Number.parseInt(e.target.value.replace(/\D/g, ""), 10);
                  if (Number.isFinite(val) && val >= 0) setMonthlyIncome(val);
                }}
                className="min-h-[48px] w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-10 pr-4 text-xl font-bold tabular-nums text-zinc-100 outline-none focus:border-zinc-700"
              />
            </div>
          </label>

          <div className="mt-3 space-y-1 rounded-xl bg-zinc-950/60 p-3 text-xs text-zinc-400">
            {categories.map((cat) => (
              <div key={cat.id} className="flex justify-between">
                <span>{cat.name} ({cat.percentage}%)</span>
                <span className="tabular-nums font-mono text-zinc-200">
                  {formatCurrency(Math.round(monthlyIncome * (cat.percentage / 100)))}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <EditAllocationModal open={editAllocOpen} onClose={() => setEditAllocOpen(false)} />
    </>
  );
}
