"use client";

import { useEffect, useRef, useState } from "react";
import { BsCheckLg, BsChevronDown } from "react-icons/bs";
import { formatCurrency, type MainCategory, type SubCategory } from "../lib/finance";
import { CategoryIcon } from "./CategoryIcon";

interface StashSelectCardProps {
  label: string;
  selectedSubId: string;
  categories: MainCategory[];
  onSelect: (subId: string) => void;
  filterCategoryId?: string;
  excludeSubId?: string;
}

export function StashSelectCard({
  label,
  selectedSubId,
  categories,
  onSelect,
  filterCategoryId,
  excludeSubId,
}: StashSelectCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside the container
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const targetCategories = filterCategoryId
    ? categories.filter((c) => c.id === filterCategoryId)
    : categories;

  let selectedSub: SubCategory | undefined;
  let selectedCat: MainCategory | undefined;

  for (const cat of categories) {
    const sub = cat.subcategories.find((s) => s.id === selectedSubId);
    if (sub) {
      selectedSub = sub;
      selectedCat = cat;
      break;
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <span className="text-xs font-medium text-zinc-400">{label}</span>

      {/* Trigger Card Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="mt-1 flex min-h-[52px] w-full items-center justify-between rounded-xl bg-zinc-900 px-3.5 py-2.5 transition-all hover:bg-zinc-800/80 active:scale-[0.99] text-left"
      >
        {selectedSub && selectedCat ? (
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-emerald-400 font-bold">
              <CategoryIcon iconName={selectedCat.icon} className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <span className="font-semibold text-zinc-200">{selectedCat.name}</span>
                <span>•</span>
                <span className="truncate">{selectedSub.name}</span>
              </div>
              <p className="font-mono text-xs font-bold text-emerald-400 mt-0.5">
                {formatCurrency(selectedSub.digital + selectedSub.cash)}
              </p>
            </div>
          </div>
        ) : (
          <span className="text-xs text-zinc-400 font-medium">Select a stash…</span>
        )}

        <BsChevronDown
          className={`h-4 w-4 shrink-0 text-zinc-400 ml-2 transition-transform duration-150 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Shadcn Inline Dropdown Popover Menu (No nested sheet/modal backdrop!) */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-[80] mt-1.5 max-h-64 overflow-y-auto rounded-2xl bg-zinc-900/95 p-2 shadow-2xl backdrop-blur-md animate-fade-in scrollbar-none border border-zinc-800/60">
          <div className="space-y-3">
            {targetCategories.map((cat) => {
              const subList = cat.subcategories.filter((s) => s.id !== excludeSubId);
              if (subList.length === 0) return null;

              return (
                <div key={cat.id} className="space-y-1">
                  <div className="flex items-center gap-2 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-950 text-emerald-400">
                      <CategoryIcon iconName={cat.icon} className="h-3 w-3" />
                    </div>
                    <span>{cat.name}</span>
                  </div>

                  <div className="space-y-1">
                    {subList.map((sub) => {
                      const isSelected = sub.id === selectedSubId;
                      const totalBal = sub.digital + sub.cash;

                      return (
                        <div
                          key={sub.id}
                          onClick={() => {
                            onSelect(sub.id);
                            setIsOpen(false);
                          }}
                          className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 transition-all ${
                            isSelected
                              ? "bg-emerald-500/10 text-emerald-400 font-semibold"
                              : "bg-zinc-950/60 hover:bg-zinc-950 text-zinc-200"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-emerald-400 font-bold">
                              <CategoryIcon iconName={cat.icon} className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-zinc-100">
                                {sub.name} <span className="font-normal text-zinc-400">({cat.name})</span>
                              </p>
                              <p className="text-[10px] text-zinc-400">
                                Digital {formatCurrency(sub.digital)} • Cash {formatCurrency(sub.cash)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-emerald-400">
                              {formatCurrency(totalBal)}
                            </span>
                            {isSelected && <BsCheckLg className="h-3.5 w-3.5 text-emerald-400" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
