"use client";

import { useState } from "react";
import { BsBoxArrowRight, BsCheckLg, BsPerson, BsShieldCheck } from "react-icons/bs";
import { AuthModal } from "../../components/AuthModal";
import { formatCurrency } from "../../lib/finance";
import { useApp } from "../../lib/store";

export default function MePage() {
  const {
    user,
    isAuthenticated,
    logout,
    totalBalance,
    totalDigital,
    totalCash,
    categories,
    totalIncomeReceived,
  } = useApp();

  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <>
      <div className="animate-fade-in space-y-4 px-4 py-4">
        <header className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              ACCOUNT
            </span>
            <h1 className="text-xl font-bold tracking-tight text-zinc-100">Me</h1>
          </div>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 rounded-xl bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 transition-all hover:bg-rose-500/20 active:scale-95"
            >
              <BsBoxArrowRight className="h-3.5 w-3.5" />
              Sign Out
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-95"
            >
              <BsPerson className="h-3.5 w-3.5" />
              Sign In
            </button>
          )}
        </header>

        {/* User Card */}
        <section className="rounded-2xl bg-zinc-900/60 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800 font-bold text-zinc-200 text-lg">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-bold text-zinc-100">
                  {user?.name || "Guest Account"}
                </p>
                {isAuthenticated && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                    <BsShieldCheck className="h-3 w-3" /> Neon DB
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-zinc-400 truncate">
                {user?.email || "Local temp session • Sign in to save to cloud"}
              </p>
            </div>
          </div>
        </section>

        {/* Summary Card */}
        <section className="rounded-2xl bg-zinc-900/60 p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Financial Summary
          </h2>
          <div className="mt-3 space-y-2.5">
            {[
              { label: "Total balance", value: formatCurrency(totalBalance) },
              { label: "Digital Wallet", value: formatCurrency(totalDigital) },
              { label: "Cash on Hand", value: formatCurrency(totalCash) },
              { label: "Income received", value: formatCurrency(totalIncomeReceived) },
              { label: "Active stashes", value: String(categories.length) },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">{row.label}</span>
                <span className="font-semibold tabular-nums text-zinc-200">{row.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* System & Storage */}
        <section className="rounded-2xl bg-zinc-900/60 p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Storage Engine
          </h2>
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex items-center justify-between rounded-xl bg-zinc-950/70 p-3">
              <span className="text-zinc-300 font-medium">Database ORM</span>
              <span className="font-mono text-emerald-400">Drizzle ORM</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-zinc-950/70 p-3">
              <span className="text-zinc-300 font-medium">Postgres Host</span>
              <span className="font-mono text-emerald-400">Neon DB</span>
            </div>
          </div>
        </section>

        {!isAuthenticated && (
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-xs font-bold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-[0.99]"
          >
            <BsCheckLg className="h-4 w-4" />
            Sign In / Register Account
          </button>
        )}
      </div>

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
