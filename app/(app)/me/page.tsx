"use client";

import { formatCurrency } from "../../lib/finance";
import { useApp } from "../../lib/store";

export default function MePage() {
  const { totalBalance, totalDigital, totalCash, categories, totalIncomeReceived } = useApp();

  function resetData() {
    if (typeof window !== "undefined" && window.confirm("Reset all data to defaults?")) {
      localStorage.removeItem("stash-app-state");
      window.location.reload();
    }
  }

  return (
    <div className="animate-fade-in space-y-4 px-4 py-4">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Me</h1>
        <p className="mt-1 text-sm text-slate-400">Account overview</p>
      </header>

      <section className="rounded-[24px] border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/20 text-2xl font-bold text-teal-300">
            S
          </div>
          <div>
            <p className="font-semibold">Stash User</p>
            <p className="text-sm text-slate-400">Mobile finance</p>
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-white/10 bg-neutral-900/80 p-4">
        <h2 className="font-semibold">Summary</h2>
        <div className="mt-3 space-y-3">
          {[
            { label: "Total balance", value: formatCurrency(totalBalance) },
            { label: "Digital", value: formatCurrency(totalDigital) },
            { label: "Cash on Hand", value: formatCurrency(totalCash) },
            { label: "Income received", value: formatCurrency(totalIncomeReceived) },
            { label: "Active stashes", value: String(categories.length) },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between text-sm">
              <span className="text-slate-400">{row.label}</span>
              <span className="font-medium tabular-nums">{row.value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] border border-white/10 bg-neutral-900/80 p-4">
        <h2 className="font-semibold">Preferences</h2>
        <div className="mt-3 space-y-2">
          <div className="flex min-h-[48px] items-center justify-between rounded-xl bg-neutral-950/60 px-3">
            <span className="text-sm">Dark mode</span>
            <span className="rounded-full bg-teal-500/20 px-2.5 py-1 text-xs font-medium text-teal-300">
              On
            </span>
          </div>
          <div className="flex min-h-[48px] items-center justify-between rounded-xl bg-neutral-950/60 px-3">
            <span className="text-sm">Currency</span>
            <span className="text-sm text-slate-400">PHP (₱)</span>
          </div>
        </div>
      </section>

      <button
        type="button"
        onClick={resetData}
        className="flex min-h-[48px] w-full items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/10 text-sm font-medium text-red-300 transition-all active:scale-[0.98]"
      >
        Reset app data
      </button>
    </div>
  );
}
