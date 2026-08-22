"use client";

import { useState } from "react";
import { AuthModal } from "./AuthModal";
import { AiTwotoneBuild, AiTwotoneCalendar, AiTwotoneCreditCard, AiTwotoneGold, AiTwotoneProject, AiTwotoneSliders } from "react-icons/ai";
import { PiBracketsSquareDuotone, PiCalendarDuotone, PiScrollDuotone, PiSealPercentDuotone } from "react-icons/pi";

export function LandingPage() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  function openAuth(mode: "login" | "register") {
    setAuthMode(mode);
    setAuthModalOpen(true);
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-slate-100 flex flex-col font-sans">
      <div className="flex-1 mx-auto max-w-5xl w-full px-6 py-8 md:py-16 space-y-16 md:space-y-16">
        
        {/* ── Navbar/Header ── */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/stash-logo.png" className="w-5 h-auto" alt="Stash Logo" />
            <span className="text-lg font-black tracking-widest uppercase text-zinc-100">Stash</span>
          </div>
          {/* <button
            type="button"
            onClick={() => openAuth("login")}
            className="rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-zinc-300 px-4 py-2 transition-all active:scale-[0.98]"
          >
            Sign in
          </button> */}
        </header>

        {/* ── Hero Section (Split flex layout) ── */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-10 md:gap-16">
          {/* Left CTA Column */}
          <div className="flex-1 space-y-6 text-left max-w-lg">
            <h1 className="text-[2.25rem] md:text-[3rem] leading-[1.1] font-extrabold tracking-tight text-zinc-100">
              Know exactly<br />
              where your<br />
              <span className="text-emerald-400">money goes.</span>
            </h1>

            <p className="text-sm md:text-base text-zinc-400 leading-relaxed max-w-[340px]">
              Stash splits your income across budget categories, tracks every expense, and keeps your finances clear — all in one place.
            </p>

            <div className="pt-2 flex flex-row gap-3 w-full">
              <button
                type="button"
                onClick={() => openAuth("register")}
                className="min-h-[50px] w-full px-8 rounded-2xl bg-emerald-500 text-sm font-bold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-[0.99]"
              >
                Get Started
              </button>
              <button
                type="button"
                onClick={() => openAuth("login")}
                className="min-h-[46px] w-full px-8 rounded-2xl bg-zinc-900 text-sm font-semibold text-zinc-300 transition-all hover:bg-zinc-800 active:scale-[0.99]"
              >
                Sign in
              </button>
            </div>
          </div>

          {/* Right Screenshot Column (Centered inside desktop view) */}
          <div className="flex-1 flex justify-center md:justify-end animate-fade-up-premium">
            <div className="relative w-full max-w-[260px] rounded-3xl overflow-hidden border border-zinc-800/80 shadow-2xl bg-neutral-900">
              <img
                src="/snapshot.jpg"
                alt="Stash dashboard screenshot"
                className="w-full h-auto block object-cover"
              />
              {/* Fade gradient mask/filter at the bottom for premium look */}
              <div className="absolute inset-x-0 bottom-0 h-[25%] bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-transparent pointer-events-none" />
            </div>
          </div>
        </section>

        {/* ── Key Features ── */}
        <section className="space-y-4">
          <p className="font-extrabold text-2xl text-zinc-100 tracking-tight">
            What's inside?
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-zinc-900/40 border border-zinc-800/30 p-5">
              <PiSealPercentDuotone className="h-6 w-6 text-emerald-400 mb-2" />
              <p className="text-sm font-bold text-zinc-100 mb-1.5">Automatic Allocation</p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Assign a percentage of your income to Savings, Expenses, and Liabilities. Stash distributes funds automatically whenever income arrives.
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-900/40 border border-zinc-800/30 p-5">
              <PiBracketsSquareDuotone className="h-6 w-6 text-emerald-400 mb-2" />
              <p className="text-sm font-bold text-zinc-100 mb-1.5">Sub-stashes with caps & overflow</p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Break each category into named stashes — Rent, Food, Emergency Fund. Set limits and automatically redirect excess to wherever it should go.
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-900/40 border border-zinc-800/30 p-5">
              <PiScrollDuotone className="h-6 w-6 text-emerald-400 mb-2" />
              <p className="text-sm font-bold text-zinc-100 mb-1.5">Pay Later tracking</p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Log installment plans and one-time obligations. Mark payments done and optionally deduct the amount directly from a stash.
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-900/40 border border-zinc-800/30 p-5">
              <PiCalendarDuotone className="h-6 w-6 text-emerald-400 mb-2" />
              <p className="text-sm font-bold text-zinc-100 mb-1.5">Subscriptions calendar</p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Add recurring bills and see upcoming charges on a calendar. Icons appear on billing dates so nothing slips through.
              </p>
            </div>
          </div>
        </section>
      </div>

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
