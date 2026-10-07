"use client";

import { BsArrowBarUp, BsArrowLeftRight, BsCoin, BsPlusLg } from "react-icons/bs";
import { getExpenseTag } from "../lib/expenseTags";
import { formatCurrency } from "../lib/finance";

export interface TransactionRecord {
  id: string;
  type: "income" | "expense" | "transfer_internal" | "transfer_sub";
  amount: number;
  source: string | null;
  description: string | null;
  subCategoryName?: string | null;
  breakdown?: Record<string, number> | null;
  tag?: string | null;
  createdAt: string;
}

interface ExpenseRecordCardProps {
  transaction: TransactionRecord;
  onClick?: () => void;
  showDate?: boolean;
  className?: string;
}

export function ExpenseRecordCard({
  transaction,
  onClick,
  showDate = false,
  className = "",
}: ExpenseRecordCardProps) {
  const isIncome = transaction.type === "income";
  const isExpense = transaction.type === "expense";
  const isInternalTransfer = transaction.type === "transfer_internal";
  const isSubTransfer = transaction.type === "transfer_sub";

  const tagDef = isExpense ? getExpenseTag(transaction.tag) : null;
  const TagIcon = tagDef?.icon;

  const dateObj = new Date(transaction.createdAt);
  const timeFormatted = showDate
    ? dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : dateObj.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

  const isToCashInternal =
    transaction.source === "digital_to_cash" ||
    transaction.description?.toLowerCase().includes("to cash");
  const isDigitalSource =
    transaction.source === "digital" || transaction.source === "digital_to_cash";

  const renderTitle = () => {
    if (isIncome) return "Income Deposit";
    if (isExpense) return transaction.description || transaction.subCategoryName || "Expense";
    if (isSubTransfer && transaction.description && transaction.description.includes(" to ")) {
      const parts = transaction.description.split(" to ");
      return (
        <span>
          <strong className="font-bold text-zinc-100">{parts[0]}</strong>{" "}
          <span className="font-normal text-zinc-400 text-xs">to</span>{" "}
          <strong className="font-bold text-zinc-100">{parts[1]}</strong>
        </span>
      );
    }
    return transaction.description || "Stash Transfer";
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl bg-zinc-900/40 p-4 transition-all border border-zinc-800/30 ${
        onClick ? "cursor-pointer hover:bg-zinc-900/70" : ""
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Circular Logo: Minus (Red), Plus (Yellow), Transfer (Grey) */}
          <div
            className={`flex shrink-0 h-9 w-9 items-center justify-center rounded-full font-bold mt-0.5 ${
              isIncome
                ? "bg-zinc-800 text-emerald-400"
                : isExpense
                  ? "bg-zinc-800 text-rose-400"
                  : "bg-zinc-800 text-zinc-300"
            }`}
          >
            {isIncome ? (
              <BsPlusLg className="h-4 w-4" />
            ) : isExpense ? (
              <BsArrowBarUp className="h-4 w-4" />
            ) : (
              <BsArrowLeftRight className="h-4 w-4" />
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <p className="font-semibold text-sm text-zinc-100 leading-snug capitalize">
              {renderTitle()}
            </p>

            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Expense Category Tag Badge */}
              {isExpense && tagDef && (
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold rounded-md px-2 py-0.5 border ${tagDef.bgBadge} ${tagDef.borderBadge}`}
                >
                  {TagIcon && <TagIcon className="h-2.5 w-2.5" />}
                  <span>{tagDef.label}</span>
                </span>
              )}

              {/* Stash Badge for Expense */}
              {/* {isExpense && transaction.subCategoryName && (
                <span className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                  {transaction.subCategoryName}
                </span>
              )} */}

              {/* Direction Pill Badges for Internal Transfer */}
              {isInternalTransfer && (
                <div className="inline-flex items-center gap-1">
                  {isToCashInternal ? (
                    <>
                      <span className="text-[10px] font-bold rounded-full px-2 py-0.5 text-green-300 bg-green-300/10">
                        Digital
                      </span>
                      <span className="text-xs text-zinc-400 font-bold">→</span>
                      <span className="text-[10px] font-bold rounded-full px-2 py-0.5 text-[#ffff64] bg-[#ffff64]/10">
                        Cash
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] font-bold rounded-full px-2 py-0.5 text-[#ffff64] bg-[#ffff64]/10">
                        Cash
                      </span>
                      <span className="text-xs text-zinc-400 font-bold">→</span>
                      <span className="text-[10px] font-bold rounded-full px-2 py-0.5 text-green-300 bg-green-300/10">
                        Digital
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Source Badge (Digital / Cash) */}
              {/* {(isSubTransfer || isExpense) && (
                <span
                  className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${
                    isDigitalSource
                      ? "text-green-300 bg-green-300/10"
                      : "text-[#ffff64] bg-[#ffff64]/10"
                  }`}
                >
                  {isDigitalSource ? "Digital" : "Cash"}
                </span>
              )} */}

            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <p
            className={`text-base font-bold tabular-nums ${
              isIncome
              ? "text-emerald-400"
              : isExpense
              ? "text-rose-400"
              : "text-zinc-200"
            }`}
          >
            {isIncome ? "+" : isExpense ? "-" : ""}
            {formatCurrency(transaction.amount)}
          </p>
            <span className="text-[11px] text-zinc-400">{timeFormatted}</span>
        </div>
      </div>

      {/* Income per-category allocation breakdown display */}
      {isIncome && transaction.breakdown && Object.keys(transaction.breakdown).length > 0 && (
        <div className="mt-3 border-t border-zinc-800/40 pt-2.5 pl-12">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Allocated per budget category:
          </span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {Object.entries(transaction.breakdown).map(([catName, allocatedAmt]) => (
              <span
                key={catName}
                className="inline-flex items-center gap-1 rounded-lg bg-zinc-950 px-2 py-0.5 text-xs text-zinc-300"
              >
                <span className="font-medium">{catName}:</span>
                <span className="font-mono text-emerald-400">
                  +{formatCurrency(allocatedAmt)}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
