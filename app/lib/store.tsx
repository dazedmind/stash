"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  addExpenseToCategories,
  addIncomeToCategories,
  addSubCategoryToCategory,
  buildInitialMainCategories,
  calculateAllocations,
  deleteSubCategory,
  getAllocationTotals,
  getAllSubcategories,
  getTotalBalance,
  getTotalCash,
  getTotalDigital,
  renameSubCategory,
  transferBetweenCashDigital,
  transferBetweenSubStashes,
  updateCategoryPercentages,
  type MainCategory,
  type SubCategory,
} from "./finance";

const STORAGE_KEY = "stash-app-state-v2";
const DEFAULT_INCOME = 0;

interface AppState {
  monthlyIncome: number;
  totalIncomeReceived: number;
  categories: MainCategory[];
}

interface AppContextValue {
  monthlyIncome: number;
  totalIncomeReceived: number;
  categories: MainCategory[];
  allSubcategories: SubCategory[];
  allocations: ReturnType<typeof calculateAllocations>;
  allocationTotals: ReturnType<typeof getAllocationTotals>;
  totalBalance: number;
  totalDigital: number;
  totalCash: number;
  addIncomeAmount: (amount: number) => void;
  addExpenseAmount: (
    subCategoryId: string,
    amount: number,
    source: "digital" | "cash",
  ) => void;
  transferCashDigital: (
    subCategoryId: string,
    amount: number,
    direction: "to-cash" | "to-digital",
  ) => void;
  transferSubStash: (
    fromSubId: string,
    toSubId: string,
    amount: number,
    source: "digital" | "cash",
  ) => void;
  updateAllocations: (newPercentages: Record<string, number>) => void;
  addSubCategory: (categoryId: string, name: string) => void;
  renameSubCategoryName: (subCategoryId: string, newName: string) => void;
  removeSubCategory: (subCategoryId: string) => void;
  setMonthlyIncome: (amount: number) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function loadState(): AppState {
  if (typeof window === "undefined") {
    return {
      monthlyIncome: DEFAULT_INCOME,
      totalIncomeReceived: DEFAULT_INCOME,
      categories: buildInitialMainCategories(DEFAULT_INCOME),
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        monthlyIncome: DEFAULT_INCOME,
        totalIncomeReceived: DEFAULT_INCOME,
        categories: buildInitialMainCategories(DEFAULT_INCOME),
      };
    }

    const parsed = JSON.parse(raw) as AppState;
    if (!parsed.categories || !Array.isArray(parsed.categories) || !parsed.categories[0]?.subcategories) {
      return {
        monthlyIncome: DEFAULT_INCOME,
        totalIncomeReceived: DEFAULT_INCOME,
        categories: buildInitialMainCategories(DEFAULT_INCOME),
      };
    }

    return {
      monthlyIncome: parsed.monthlyIncome ?? DEFAULT_INCOME,
      totalIncomeReceived: parsed.totalIncomeReceived ?? DEFAULT_INCOME,
      categories: parsed.categories,
    };
  } catch {
    return {
      monthlyIncome: DEFAULT_INCOME,
      totalIncomeReceived: DEFAULT_INCOME,
      categories: buildInitialMainCategories(DEFAULT_INCOME),
    };
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const addIncomeAmount = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      totalIncomeReceived: prev.totalIncomeReceived + amount,
      categories: addIncomeToCategories(prev.categories, amount),
    }));
  }, []);

  const addExpenseAmount = useCallback(
    (subCategoryId: string, amount: number, source: "digital" | "cash") => {
      setState((prev) => ({
        ...prev,
        categories: addExpenseToCategories(prev.categories, subCategoryId, amount, source),
      }));
    },
    [],
  );

  const transferCashDigital = useCallback(
    (subCategoryId: string, amount: number, direction: "to-cash" | "to-digital") => {
      setState((prev) => ({
        ...prev,
        categories: transferBetweenCashDigital(prev.categories, subCategoryId, amount, direction),
      }));
    },
    [],
  );

  const transferSubStash = useCallback(
    (fromSubId: string, toSubId: string, amount: number, source: "digital" | "cash") => {
      setState((prev) => ({
        ...prev,
        categories: transferBetweenSubStashes(prev.categories, fromSubId, toSubId, amount, source),
      }));
    },
    [],
  );

  const updateAllocations = useCallback((newPercentages: Record<string, number>) => {
    setState((prev) => ({
      ...prev,
      categories: updateCategoryPercentages(prev.categories, newPercentages),
    }));
  }, []);

  const addSubCategory = useCallback((categoryId: string, name: string) => {
    setState((prev) => ({
      ...prev,
      categories: addSubCategoryToCategory(prev.categories, categoryId, name),
    }));
  }, []);

  const renameSubCategoryName = useCallback((subCategoryId: string, newName: string) => {
    setState((prev) => ({
      ...prev,
      categories: renameSubCategory(prev.categories, subCategoryId, newName),
    }));
  }, []);

  const removeSubCategory = useCallback((subCategoryId: string) => {
    setState((prev) => ({
      ...prev,
      categories: deleteSubCategory(prev.categories, subCategoryId),
    }));
  }, []);

  const setMonthlyIncome = useCallback((amount: number) => {
    setState((prev) => ({ ...prev, monthlyIncome: amount }));
  }, []);

  const value = useMemo<AppContextValue>(() => {
    const incomeBase = state.totalIncomeReceived || state.monthlyIncome;

    return {
      monthlyIncome: state.monthlyIncome,
      totalIncomeReceived: state.totalIncomeReceived,
      categories: state.categories,
      allSubcategories: getAllSubcategories(state.categories),
      allocations: calculateAllocations(incomeBase, state.categories),
      allocationTotals: getAllocationTotals(state.categories),
      totalBalance: getTotalBalance(state.categories),
      totalDigital: getTotalDigital(state.categories),
      totalCash: getTotalCash(state.categories),
      addIncomeAmount,
      addExpenseAmount,
      transferCashDigital,
      transferSubStash,
      updateAllocations,
      addSubCategory,
      renameSubCategoryName,
      removeSubCategory,
      setMonthlyIncome,
    };
  }, [
    state,
    addIncomeAmount,
    addExpenseAmount,
    transferCashDigital,
    transferSubStash,
    updateAllocations,
    addSubCategory,
    renameSubCategoryName,
    removeSubCategory,
    setMonthlyIncome,
  ]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-slate-400">
        Loading…
      </div>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
