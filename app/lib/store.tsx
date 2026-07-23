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
  toggleHideSubCategoryInCategories,
  transferBetweenCashDigital,
  transferBetweenSubStashes,
  updateCategoryPercentages,
  type MainCategory,
  type SubCategory,
} from "./finance";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  monthlyIncome: number;
  totalIncomeReceived: number;
}

interface AppContextValue {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  monthlyIncome: number;
  totalIncomeReceived: number;
  categories: MainCategory[];
  allSubcategories: SubCategory[];
  allocations: ReturnType<typeof calculateAllocations>;
  allocationTotals: ReturnType<typeof getAllocationTotals>;
  totalBalance: number;
  totalDigital: number;
  totalCash: number;
  login: (email: string, password: string) => Promise<string | null>;
  register: (email: string, password: string, name?: string) => Promise<string | null>;
  logout: () => Promise<void>;
  refreshData: () => Promise<void>;
  addIncomeAmount: (amount: number) => Promise<void>;
  addExpenseAmount: (
    subCategoryId: string,
    amount: number,
    source: "digital" | "cash",
    note?: string
  ) => Promise<void>;
  transferCashDigital: (
    subCategoryId: string,
    amount: number,
    direction: "to-cash" | "to-digital"
  ) => Promise<void>;
  transferSubStash: (
    fromSubId: string,
    toSubId: string,
    amount: number,
    source: "digital" | "cash"
  ) => Promise<void>;
  toggleHideSubCategory: (subCategoryId: string) => Promise<void>;
  updateAllocations: (newPercentages: Record<string, number>) => Promise<void>;
  addSubCategory: (categoryId: string, name: string) => Promise<void>;
  renameSubCategoryName: (subCategoryId: string, newName: string) => Promise<void>;
  removeSubCategory: (subCategoryId: string) => Promise<void>;
  setMonthlyIncome: (amount: number) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [categories, setCategories] = useState<MainCategory[]>(() => buildInitialMainCategories());
  const [guestMonthlyIncome, setGuestMonthlyIncome] = useState(0);
  const [guestTotalIncome, setGuestTotalIncome] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFinanceData = useCallback(async () => {
    try {
      const res = await fetch("/api/finance/data");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          if (data.categories?.length) {
            setCategories(data.categories);
          }
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Error loading data from database API:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFinanceData();
  }, [fetchFinanceData]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return data.error || "Login failed";
      }
      setUser(data.user);
      await fetchFinanceData();
      return null;
    } catch {
      return "Network error during login";
    }
  }, [fetchFinanceData]);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) {
        return data.error || "Registration failed";
      }
      setUser(data.user);
      await fetchFinanceData();
      return null;
    } catch {
      return "Network error during registration";
    }
  }, [fetchFinanceData]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setCategories(buildInitialMainCategories());
      setGuestMonthlyIncome(0);
      setGuestTotalIncome(0);
    } catch (err) {
      console.error("Logout error:", err);
    }
  }, []);

  const addIncomeAmount = useCallback(async (amount: number) => {
    setCategories((prev) => addIncomeToCategories(prev, amount));
    setGuestTotalIncome((prev) => prev + amount);

    setUser((prev) =>
      prev ? { ...prev, totalIncomeReceived: prev.totalIncomeReceived + amount } : null
    );

    if (user) {
      try {
        await fetch("/api/finance/income", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount }),
        });
        await fetchFinanceData();
      } catch (err) {
        console.error("Income persistence error:", err);
      }
    }
  }, [user, fetchFinanceData]);

  const addExpenseAmount = useCallback(
    async (subCategoryId: string, amount: number, source: "digital" | "cash", note?: string) => {
      setCategories((prev) => addExpenseToCategories(prev, subCategoryId, amount, source));

      if (user) {
        try {
          await fetch("/api/finance/expense", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subCategoryId, amount, source, note }),
          });
          await fetchFinanceData();
        } catch (err) {
          console.error("Expense persistence error:", err);
        }
      }
    },
    [user, fetchFinanceData]
  );

  const toggleHideSubCategory = useCallback(
    async (subCategoryId: string) => {
      let isNowHidden = false;
      setCategories((prev) => {
        const sub = prev.flatMap((c) => c.subcategories).find((s) => s.id === subCategoryId);
        isNowHidden = !sub?.isHidden;
        return toggleHideSubCategoryInCategories(prev, subCategoryId);
      });

      if (user) {
        try {
          await fetch("/api/finance/subcategories", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subCategoryId, isHidden: isNowHidden }),
          });
          await fetchFinanceData();
        } catch (err) {
          console.error("Toggle hide subcategory error:", err);
        }
      }
    },
    [user, fetchFinanceData]
  );

  const transferCashDigital = useCallback(
    async (subCategoryId: string, amount: number, direction: "to-cash" | "to-digital") => {
      setCategories((prev) => transferBetweenCashDigital(prev, subCategoryId, amount, direction));

      if (user) {
        try {
          await fetch("/api/finance/transfer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transferType: "internal", subCategoryId, amount, direction }),
          });
          await fetchFinanceData();
        } catch (err) {
          console.error("Transfer persistence error:", err);
        }
      }
    },
    [user, fetchFinanceData]
  );

  const transferSubStash = useCallback(
    async (fromSubId: string, toSubId: string, amount: number, source: "digital" | "cash") => {
      setCategories((prev) => transferBetweenSubStashes(prev, fromSubId, toSubId, amount, source));

      if (user) {
        try {
          await fetch("/api/finance/transfer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transferType: "between", fromSubId, toSubId, amount, source }),
          });
          await fetchFinanceData();
        } catch (err) {
          console.error("Substash transfer persistence error:", err);
        }
      }
    },
    [user, fetchFinanceData]
  );

  const updateAllocations = useCallback(
    async (newPercentages: Record<string, number>) => {
      setCategories((prev) => updateCategoryPercentages(prev, newPercentages));

      if (user) {
        try {
          await fetch("/api/finance/allocations", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ percentages: newPercentages }),
          });
          await fetchFinanceData();
        } catch (err) {
          console.error("Allocations persistence error:", err);
        }
      }
    },
    [user, fetchFinanceData]
  );

  const addSubCategory = useCallback(
    async (categoryId: string, name: string) => {
      setCategories((prev) => addSubCategoryToCategory(prev, categoryId, name));

      if (user) {
        try {
          await fetch("/api/finance/subcategories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ categoryId, name }),
          });
          await fetchFinanceData();
        } catch (err) {
          console.error("Add subcategory persistence error:", err);
        }
      }
    },
    [user, fetchFinanceData]
  );

  const renameSubCategoryName = useCallback(
    async (subCategoryId: string, newName: string) => {
      setCategories((prev) => renameSubCategory(prev, subCategoryId, newName));

      if (user) {
        try {
          await fetch("/api/finance/subcategories", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subCategoryId, name: newName }),
          });
          await fetchFinanceData();
        } catch (err) {
          console.error("Rename subcategory persistence error:", err);
        }
      }
    },
    [user, fetchFinanceData]
  );

  const removeSubCategory = useCallback(
    async (subCategoryId: string) => {
      setCategories((prev) => deleteSubCategory(prev, subCategoryId));

      if (user) {
        try {
          await fetch(`/api/finance/subcategories?id=${subCategoryId}`, {
            method: "DELETE",
          });
          await fetchFinanceData();
        } catch (err) {
          console.error("Delete subcategory persistence error:", err);
        }
      }
    },
    [user, fetchFinanceData]
  );

  const setMonthlyIncome = useCallback(
    async (amount: number) => {
      setGuestMonthlyIncome(amount);
      setUser((prev) => (prev ? { ...prev, monthlyIncome: amount } : null));

      if (user) {
        try {
          await fetch("/api/finance/monthly-income", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount }),
          });
          await fetchFinanceData();
        } catch (err) {
          console.error("Monthly income persistence error:", err);
        }
      }
    },
    [user, fetchFinanceData]
  );

  const value = useMemo<AppContextValue>(() => {
    const monthlyInc = user?.monthlyIncome ?? guestMonthlyIncome;
    const totalInc = user?.totalIncomeReceived ?? guestTotalIncome;

    return {
      user,
      isAuthenticated: !!user,
      isLoading,
      monthlyIncome: monthlyInc,
      totalIncomeReceived: totalInc,
      categories,
      allSubcategories: getAllSubcategories(categories),
      allocations: calculateAllocations(totalInc, categories),
      allocationTotals: getAllocationTotals(categories),
      totalBalance: getTotalBalance(categories),
      totalDigital: getTotalDigital(categories),
      totalCash: getTotalCash(categories),
      login,
      register,
      logout,
      refreshData: fetchFinanceData,
      addIncomeAmount,
      addExpenseAmount,
      transferCashDigital,
      transferSubStash,
      toggleHideSubCategory,
      updateAllocations,
      addSubCategory,
      renameSubCategoryName,
      removeSubCategory,
      setMonthlyIncome,
    };
  }, [
    user,
    isLoading,
    categories,
    guestMonthlyIncome,
    guestTotalIncome,
    login,
    register,
    logout,
    fetchFinanceData,
    addIncomeAmount,
    addExpenseAmount,
    transferCashDigital,
    transferSubStash,
    toggleHideSubCategory,
    updateAllocations,
    addSubCategory,
    renameSubCategoryName,
    removeSubCategory,
    setMonthlyIncome,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
