"use client";

import { BsTrash } from "react-icons/bs";
import { formatCurrency } from "../lib/finance";
import { CategoryIcon } from "./CategoryIcon";
import type { Subscription } from "../lib/finance";
import { useApp } from "../lib/store";

interface SubscriptionCardProps {
  subscription: Subscription;
}

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const { removeSubscription } = useApp();

  const handleRemove = async () => {
    if (confirm(`Are you sure you want to remove ${subscription.name}?`)) {
      await removeSubscription(subscription.id);
    }
  };

  const nextBillingDate = new Date(subscription.billingDate);
  const formattedDate = nextBillingDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  return (
    <article className="group relative flex items-center justify-between rounded-2xl bg-zinc-900/60 p-4 transition-all duration-200 hover:bg-zinc-900">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-emerald-400 to-emerald-700 text-black shadow-lg">
          <CategoryIcon iconName={subscription.icon} className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-zinc-100">{subscription.name}</h3>
          <p className="text-xs font-medium text-zinc-400 capitalize">
            {subscription.billingCycle} • Next: {formattedDate}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-lg font-bold text-zinc-100">
          {formatCurrency(subscription.amount)}
        </span>
        <button
          onClick={handleRemove}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 opacity-0 transition-all hover:bg-rose-500/20 hover:text-rose-400 group-hover:opacity-100"
          title="Remove subscription"
        >
          <BsTrash className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}
