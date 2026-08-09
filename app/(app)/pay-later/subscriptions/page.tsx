"use client";

import { useState } from "react";
import { BsArrowLeft, BsPlusLg } from "react-icons/bs";
import Link from "next/link";
import { useApp } from "../../../lib/store";
import { Calendar } from "../../../components/Calendar";
import { SubscriptionCard } from "../../../components/SubscriptionCard";
import { AddSubscriptionSheet } from "../../../components/AddSubscriptionSheet";

export default function SubscriptionsPage() {
  const { subscriptions } = useApp();
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 pb-24 text-zinc-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 p-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <Link
            href="/pay-later"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 transition-colors hover:bg-zinc-900/80"
          >
            <BsArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold">Subscriptions</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl p-4 space-y-8">
        {/* Calendar Section */}
        <section>
          <Calendar subscriptions={subscriptions} />
        </section>

        {/* Subscriptions List */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Active Subscriptions</h2>
            <button
              onClick={() => setIsAddSheetOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 transition-colors hover:bg-emerald-500/20"
            >
              <BsPlusLg className="h-3 w-3" />
              Add
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {subscriptions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center">
                <p className="text-sm font-medium text-zinc-500">No active subscriptions</p>
                <button
                  onClick={() => setIsAddSheetOpen(true)}
                  className="mt-3 text-sm font-bold text-emerald-400"
                >
                  + Add your first subscription
                </button>
              </div>
            ) : (
              subscriptions.map((sub) => (
                <SubscriptionCard key={sub.id} subscription={sub} />
              ))
            )}
          </div>
        </section>
      </main>

      <AddSubscriptionSheet 
        open={isAddSheetOpen} 
        onClose={() => setIsAddSheetOpen(false)} 
      />
    </div>
  );
}
