"use client";

import { useEffect, useState } from "react";
import { BsArrowLeftRight, BsCash, BsCreditCard } from "react-icons/bs";
import { formatCurrency } from "../lib/finance";
import { useApp } from "../lib/store";
import { StashSelectCard } from "./StashSelectCard";

interface SubStashTransferSheetProps {
  open: boolean;
  onClose: () => void;
  initialFromSubId?: string;
}

export function SubStashTransferSheet({
  open,
  onClose,
  initialFromSubId,
}: SubStashTransferSheetProps) {
  const { categories, allSubcategories, transferCashDigital, transferSubStash } = useApp();
  const [transferType, setTransferType] = useState<"internal" | "between-stashes">("between-stashes");
  const [fromSubId, setFromSubId] = useState<string>("");
  const [toSubId, setToSubId] = useState<string>("");
  const [direction, setDirection] = useState<"to-cash" | "to-digital">("to-cash");
  const [source, setSource] = useState<"digital" | "cash">("digital");
  const [amount, setAmount] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount("");
      setSource("digital");
      setDirection("to-cash");
      const defaultFrom = initialFromSubId || (allSubcategories.length > 0 ? allSubcategories[0].id : "");
      setFromSubId(defaultFrom);

      const defaultTo = allSubcategories.find((s) => s.id !== defaultFrom)?.id || "";
      setToSubId(defaultTo);

      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [open, initialFromSubId, allSubcategories]);

  if (!open) return null;

  const fromSub = allSubcategories.find((s) => s.id === fromSubId);
  const fromCategory = categories.find((c) => c.id === fromSub?.categoryId);

  const parsedAmount = Number.parseInt(amount.replace(/\D/g, ""), 10) || 0;

  let maxAmount = 0;
  if (transferType === "internal") {
    maxAmount = direction === "to-cash" ? (fromSub?.digital || 0) : (fromSub?.cash || 0);
  } else {
    maxAmount = source === "digital" ? (fromSub?.digital || 0) : (fromSub?.cash || 0);
  }

  const isValid =
    parsedAmount > 0 &&
    parsedAmount <= maxAmount &&
    (transferType === "internal" || (fromSubId && toSubId && fromSubId !== toSubId));

  function handleSubmit() {
    if (!isValid || !fromSubId) return;

    if (transferType === "internal") {
      transferCashDigital(fromSubId, parsedAmount, direction);
    } else {
      if (!toSubId) return;
      transferSubStash(fromSubId, toSubId, parsedAmount, source);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close"
        className={`absolute inset-0 bg-black/70 transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-lg rounded-t-3xl bg-zinc-950 p-5 shadow-2xl transition-transform duration-200 ease-out ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="mx-auto mb-4 h-1 w-8 rounded-full bg-zinc-800" />

        <div className="flex items-center gap-2">
          <BsArrowLeftRight className="h-4 w-4 text-emerald-400" />
          <h2 className="text-xl font-semibold text-zinc-100">Transfer Funds</h2>
        </div>

        {/* Mode Selector */}
        <div className="mt-4 grid grid-cols-2 gap-1.5 rounded-xl bg-zinc-900/60 p-1">
          <button
            type="button"
            onClick={() => setTransferType("between-stashes")}
            className={`min-h-[36px] rounded-lg text-xs font-medium transition-colors ${
              transferType === "between-stashes"
                ? "bg-zinc-800 text-zinc-100 font-semibold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Other Stash
          </button>
          <button
            type="button"
            onClick={() => setTransferType("internal")}
            className={`min-h-[36px] rounded-lg text-xs font-medium transition-colors ${
              transferType === "internal"
                ? "bg-zinc-800 text-zinc-100 font-semibold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Internal Transfer
          </button>
        </div>

        {transferType === "between-stashes" ? (
          <div className="mt-3.5 space-y-3">
            {/* Scoped From Stash Selector Card with Category Icons */}
            <StashSelectCard
              label="From"
              selectedSubId={fromSubId}
              categories={categories}
              filterCategoryId={fromCategory?.id}
              onSelect={(newFrom) => {
                setFromSubId(newFrom);
                if (newFrom === toSubId) {
                  const other = allSubcategories.find((s) => s.id !== newFrom);
                  if (other) setToSubId(other.id);
                }
              }}
            />

            {/* Target Stash Selector Card with Category Icons */}
            <StashSelectCard
              label="To Target Stash"
              selectedSubId={toSubId}
              categories={categories}
              excludeSubId={fromSubId}
              onSelect={(newTo) => setToSubId(newTo)}
            />

            {/* Payment Source Selection Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSource("digital")}
                className={`min-h-[40px] rounded-xl text-xs font-medium transition-colors ${
                  source === "digital"
                    ? "bg-zinc-800 text-zinc-100 font-semibold border border-zinc-700"
                    : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <BsCreditCard className="w-4 h-4 text-emerald-400"/>
                  Digital ({formatCurrency(fromSub?.digital || 0)})
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSource("cash")}
                className={`min-h-[40px] rounded-xl text-xs font-medium transition-colors ${
                  source === "cash"
                    ? "bg-zinc-800 text-zinc-100 font-semibold border border-zinc-700"
                    : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <BsCash className="w-4 h-4 text-emerald-400"/>
                  Cash ({formatCurrency(fromSub?.cash || 0)})
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-3.5 space-y-3">
            <StashSelectCard
              label="Stash"
              selectedSubId={fromSubId}
              categories={categories}
              filterCategoryId={fromCategory?.id}
              onSelect={(newFrom) => setFromSubId(newFrom)}
            />

            {/* Swap direction cards with middle switch button */}
            <div>
              <span className="text-xs text-zinc-400 font-medium">Transfer Direction</span>
              <div className="mt-1.5 flex items-center gap-2">
                {/* From Box */}
                <div className="flex-1 rounded-xl bg-zinc-900 p-3">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    {direction === "to-cash" ? (
                      <BsCreditCard className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <BsCash className="h-3.5 w-3.5 text-emerald-400" />
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-wider">From</span>
                  </div>
                  <p className="mt-1 text-xs font-bold text-zinc-100">
                    {direction === "to-cash" ? "Digital Wallet" : "Cash on Hand"}
                  </p>
                  <p className="mt-0.5 text-base text-emerald-400 font-semibold">
                    {formatCurrency(direction === "to-cash" ? (fromSub?.digital || 0) : (fromSub?.cash || 0))}
                  </p>
                </div>

                {/* Middle Swap Switch Button */}
                <button
                  type="button"
                  onClick={() => setDirection((prev) => (prev === "to-cash" ? "to-digital" : "to-cash"))}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-emerald-400 hover:bg-zinc-700 hover:text-emerald-300 transition-all active:scale-90 shadow-xs"
                  title="Swap Transfer Direction"
                >
                  <BsArrowLeftRight className="h-4 w-4" />
                </button>

                {/* To Box */}
                <div className="flex-1 rounded-xl bg-zinc-900 p-3">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    {direction === "to-cash" ? (
                      <BsCash className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <BsCreditCard className="h-3.5 w-3.5 text-emerald-400" />
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-wider">To</span>
                  </div>
                  <p className="mt-1 text-xs font-bold text-zinc-100">
                    {direction === "to-cash" ? "Cash on Hand" : "Digital Wallet"}
                  </p>
                  <p className="mt-0.5 text-base text-zinc-400">
                    {formatCurrency(direction === "to-cash" ? (fromSub?.cash || 0) : (fromSub?.digital || 0))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Amount Input */}
        <label className="mt-4 block">
          <span className="text-xs text-zinc-400 font-medium">Amount</span>
          <div className="relative mt-1.5">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-zinc-500">
              ₱
            </span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
              className="min-h-[52px] w-full rounded-xl bg-zinc-900 pl-10 pr-4 text-2xl font-bold tabular-nums text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          {parsedAmount > maxAmount && (
            <p className="mt-1 text-xs font-medium text-rose-400">
              Available: {formatCurrency(maxAmount)}
            </p>
          )}
        </label>

        {/* Presets */}
        <div className="mt-3 grid grid-cols-4 gap-2">
          {[500, 1000, 2000].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(String(Math.min(preset, maxAmount)))}
              className="min-h-[38px] rounded-xl bg-zinc-900 text-xs text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              ₱{preset.toLocaleString()}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setAmount(String(maxAmount))}
            className="min-h-[38px] rounded-xl bg-zinc-900 text-xs font-semibold text-zinc-200 transition-colors hover:bg-zinc-800"
          >
            Max
          </button>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          disabled={!isValid}
          onClick={handleSubmit}
          className="mt-5 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-sm font-bold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-[0.99] disabled:opacity-30"
        >
          <BsArrowLeftRight className="h-4 w-4" />
          Confirm Transfer
        </button>
      </div>
    </div>
  );
}
