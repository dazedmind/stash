"use client";

import { BsEyeSlash } from "react-icons/bs";
import {
  formatCurrency,
  getCategoryTotalBalance,
  getCategoryTotalCash,
  getCategoryTotalDigital,
  type MainCategory,
} from "../lib/finance";
import { CategoryIcon } from "./CategoryIcon";

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
}: StashCardProps) {
  const total = getCategoryTotalBalance(category);
  const digital = getCategoryTotalDigital(category);
  const cash = getCategoryTotalCash(category);

  return (
    <article
      onClick={onClickCard}
      className={`group cursor-pointer rounded-2xl bg-zinc-900/60 transition-all duration-200 hover:bg-zinc-900 active:scale-[0.99] ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-950 text-emerald-400 font-bold">
            <CategoryIcon iconName={category.icon} className="h-5 w-5" />
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-400">
            <h3 className="truncate font-semibold text-base text-zinc-100 transition-colors">
              {category.name}
            </h3>
            {category.percentage > 0 && (
              <span className="rounded-md bg-zinc-500/10 px-2 py-0.5 font-medium text-zinc-400">
                {category.percentage}%
              </span>
            )}
          </div>
        </div>

        <div className="text-right">
          <p className="text-lg font-semibold tabular-nums text-zinc-100">{formatCurrency(total)}</p>
        </div>
      </div>

      {/* Subcategories list */}
      <div className="mt-3.5 flex flex-wrap gap-1.5">
        {category.subcategories.map((sub) => (
          <span
            key={sub.id}
            className={`inline-flex items-center gap-1.5 rounded-lg bg-zinc-950/50 px-2.5 py-1 text-xs text-zinc-400 ${
              sub.isHidden ? "opacity-70" : ""
            }`}
          >
            {sub.isHidden ? (
              <BsEyeSlash className="h-3 w-3 text-amber-400" title="Hidden from total balance" />
            ) : (
              <CategoryIcon iconName={sub.icon} className="h-3 w-3 text-emerald-400" />
            )}
            <span className="font-medium text-zinc-300">{sub.name}</span>
          </span>
        ))}
      </div>

      <div className="mt-3.5 flex justify-between border-t border-zinc-800/40 pt-3 text-xs">
        <span className="w-fit inline-flex items-center gap-1.5 rounded-full bg-neutral-800/50 px-3 py-1 font-medium text-green-200">
          Digital: <strong className="font-mono ">{formatCurrency(digital)}</strong>
        </span>
        <span className="w-fit inline-flex items-center gap-1.5 rounded-full bg-neutral-800/50 px-3 py-1 font-medium text-emerald-200">
          Cash: <strong className="font-mono ">{formatCurrency(cash)}</strong>
        </span>
      </div>
    </article>
  );
}
