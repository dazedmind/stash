import React from "react";
import {
  BsCupHot,
  BsHeartPulse,
  BsWrench,
  BsReceipt,
  BsBag,
  BsCarFront,
  BsCapsule,
  BsBasket,
  BsTag,
} from "react-icons/bs";

export interface ExpenseTagDef {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgBadge: string;
  borderBadge: string;
}

export const EXPENSE_TAGS: ExpenseTagDef[] = [
  {
    id: "food",
    label: "Food",
    icon: BsCupHot,
    color: "text-amber-400",
    bgBadge: "bg-amber-400/10 text-amber-300 border-amber-400/20",
    borderBadge: "border-amber-400/30",
  },
  {
    id: "self_care",
    label: "Self Care",
    icon: BsHeartPulse,
    color: "text-pink-400",
    bgBadge: "bg-pink-400/10 text-pink-300 border-pink-400/20",
    borderBadge: "border-pink-400/30",
  },
  {
    id: "repairs",
    label: "Repairs",
    icon: BsWrench,
    color: "text-orange-400",
    bgBadge: "bg-orange-400/10 text-orange-300 border-orange-400/20",
    borderBadge: "border-orange-400/30",
  },
  {
    id: "bills",
    label: "Bills",
    icon: BsReceipt,
    color: "text-blue-400",
    bgBadge: "bg-blue-400/10 text-blue-300 border-blue-400/20",
    borderBadge: "border-blue-400/30",
  },
  {
    id: "shopping",
    label: "Shopping",
    icon: BsBag,
    color: "text-purple-400",
    bgBadge: "bg-purple-400/10 text-purple-300 border-purple-400/20",
    borderBadge: "border-purple-400/30",
  },
  {
    id: "transport",
    label: "Transport",
    icon: BsCarFront,
    color: "text-cyan-400",
    bgBadge: "bg-cyan-400/10 text-cyan-300 border-cyan-400/20",
    borderBadge: "border-cyan-400/30",
  },
  {
    id: "health",
    label: "Health",
    icon: BsCapsule,
    color: "text-rose-400",
    bgBadge: "bg-rose-400/10 text-rose-300 border-rose-400/20",
    borderBadge: "border-rose-400/30",
  },
  {
    id: "groceries",
    label: "Groceries",
    icon: BsBasket,
    color: "text-emerald-400",
    bgBadge: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
    borderBadge: "border-emerald-400/30",
  },
  {
    id: "other",
    label: "Other",
    icon: BsTag,
    color: "text-zinc-400",
    bgBadge: "bg-zinc-800 text-zinc-300 border-zinc-700/40",
    borderBadge: "border-zinc-700",
  },
];

export function getExpenseTag(tagId?: string | null): ExpenseTagDef {
  if (!tagId) return EXPENSE_TAGS[EXPENSE_TAGS.length - 1]; // "other"
  const normalized = tagId.toLowerCase().trim();
  const found = EXPENSE_TAGS.find(
    (t) => t.id === normalized || t.label.toLowerCase() === normalized
  );
  if (found) return found;

  return {
    id: tagId,
    label: tagId.charAt(0).toUpperCase() + tagId.slice(1).replace(/_/g, " "),
    icon: BsTag,
    color: "text-zinc-400",
    bgBadge: "bg-zinc-800 text-zinc-300 border-zinc-700/40",
    borderBadge: "border-zinc-700",
  };
}
