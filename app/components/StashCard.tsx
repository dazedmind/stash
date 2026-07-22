"use client";

import { BsArrowLeftRight } from "react-icons/bs";
import {
  formatCurrency,
  getCategoryTotalBalance,
  getCategoryTotalCash,
  getCategoryTotalDigital,
  type MainCategory,
} from "../lib/finance";

interface StashCardProps {
  category: MainCategory;
  compact?: boolean;
  onClickCard?: () => void;
  onTransfer?: () => void;
}

export function StashCard({
  category,
  compact = false,
  onClickCard,
  onTransfer,
}: StashCardProps) {
  const total = getCategoryTotalBalance(category);
  const digital = getCategoryTotalDigital(category);
  const cash = getCategoryTotalCash(category);

  return (
    <article
      onClick={onClickCard}
      className={`group cursor-pointer rounded-2xl border border-zinc-800/80 bg-zinc-900/50 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900/80 active:scale-[0.99] ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-base text-zinc-100 transition-colors">
            {category.name}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-zinc-400">
            <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 font-medium text-zinc-300">
              {category.percentage}%
            </span>
            <span>{category.subcategories.length} stashes</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold tabular-nums text-zinc-100">{formatCurrency(total)}</p>
        </div>
      </div>

      {/* Subcategories list */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {category.subcategories.map((sub) => (
          <span
            key={sub.id}
            className="inline-flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950/80 px-2.5 py-1 text-xs text-zinc-400"
          >
            <span className="font-medium text-zinc-300">{sub.name}</span>
            <span className="font-mono text-zinc-300">{formatCurrency(sub.digital + sub.cash)}</span>
          </span>
        ))}
      </div>

      <div className="mt-3.5 flex items-center justify-between border-t border-zinc-800/60 pt-3 text-xs text-zinc-400">
        <span>Digital <strong className="text-zinc-200 font-mono ml-1">{formatCurrency(digital)}</strong></span>
        <span>Cash <strong className="text-zinc-200 font-mono ml-1">{formatCurrency(cash)}</strong></span>
      </div>
    </article>
  );
}
