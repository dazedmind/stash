"use client";

import { useState } from "react";
import { ActionChoiceSheet } from "./ActionChoiceSheet";
import { BottomNav } from "./BottomNav";
import { ExpenseSheet } from "./ExpenseSheet";
import { IncomeSheet } from "./IncomeSheet";

import { useApp } from "../lib/store";
import { LandingPage } from "./LandingPage";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useApp();
  const [actionChoiceOpen, setActionChoiceOpen] = useState(false);
  const [incomeSheetOpen, setIncomeSheetOpen] = useState(false);
  const [expenseSheetOpen, setExpenseSheetOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-slate-100">
      <div
        className="mx-auto min-h-screen max-w-lg pb-[calc(80px+env(safe-area-inset-bottom,0px))]"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        {children}
      </div>

      <BottomNav onAddClick={() => setActionChoiceOpen(true)} />

      <ActionChoiceSheet
        open={actionChoiceOpen}
        onClose={() => setActionChoiceOpen(false)}
        onSelectIncome={() => setIncomeSheetOpen(true)}
        onSelectExpense={() => setExpenseSheetOpen(true)}
      />

      <IncomeSheet
        open={incomeSheetOpen}
        onClose={() => setIncomeSheetOpen(false)}
      />

      <ExpenseSheet
        open={expenseSheetOpen}
        onClose={() => setExpenseSheetOpen(false)}
      />
    </div>
  );
}
