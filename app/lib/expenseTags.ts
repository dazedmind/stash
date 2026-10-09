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
    bgBadge: "bg-amber-400/10 text-amber-300",
    borderBadge: "",
  },
  {
    id: "self_care",
    label: "Self Care",
    icon: BsHeartPulse,
    color: "text-pink-400",
    bgBadge: "bg-pink-400/10 text-pink-300",
    borderBadge: "",
  },
  {
    id: "repairs",
    label: "Repairs",
    icon: BsWrench,
    color: "text-orange-400",
    bgBadge: "bg-orange-400/10 text-orange-300",
    borderBadge: "",
  },
  {
    id: "bills",
    label: "Bills",
    icon: BsReceipt,
    color: "text-blue-400",
    bgBadge: "bg-blue-400/10 text-blue-300",
    borderBadge: "",
  },
  {
    id: "shopping",
    label: "Shopping",
    icon: BsBag,
    color: "text-purple-400",
    bgBadge: "bg-purple-400/10 text-purple-300",
    borderBadge: "",
  },
  {
    id: "transport",
    label: "Transport",
    icon: BsCarFront,
    color: "text-cyan-400",
    bgBadge: "bg-cyan-400/10 text-cyan-300",
    borderBadge: "",
  },
  {
    id: "health",
    label: "Health",
    icon: BsCapsule,
    color: "text-rose-400",
    bgBadge: "bg-rose-400/10 text-rose-300",
    borderBadge: "",
  },
  {
    id: "groceries",
    label: "Groceries",
    icon: BsBasket,
    color: "text-emerald-400",
    bgBadge: "bg-emerald-400/10 text-emerald-300",
    borderBadge: "",
  },
  {
    id: "other",
    label: "Other",
    icon: BsTag,
    color: "text-zinc-400",
    bgBadge: "bg-zinc-800 text-zinc-300",
    borderBadge: "",
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
    bgBadge: "bg-zinc-800 text-zinc-300",
    borderBadge: "",
  };
}
