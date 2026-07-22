export type CategoryTag = "Savings" | "Liabilities" | "Expenses";

export interface SubCategory {
  id: string;
  categoryId: string;
  name: string;
  digital: number;
  cash: number;
  allocated: number;
}

export interface MainCategory {
  id: string;
  name: string;
  tag: CategoryTag;
  percentage: number;
  subcategories: SubCategory[];
}

export const DEFAULT_ALLOCATION_RULE: Record<CategoryTag, number> = {
  Savings: 30,
  Liabilities: 30,
  Expenses: 40,
};

export function buildInitialMainCategories(income = 0): MainCategory[] {
  // If income provided, calculate base, else use sensible default mock values
  const safeIncome = Number.isFinite(income) && income > 0 ? income : 50000;
  const savingsBudget = Math.round(safeIncome * 0.3);
  const liabilitiesBudget = Math.round(safeIncome * 0.3);
  const expensesBudget = Math.round(safeIncome * 0.4);

  return [
    {
      id: "savings",
      name: "Savings",
      tag: "Savings",
      percentage: 30,
      subcategories: [
        {
          id: "savings-needs",
          categoryId: "savings",
          name: "Needs",
          digital: Math.round(savingsBudget * 0.65),
          cash: 1000,
          allocated: Math.round(savingsBudget * 0.65) + 1000,
        },
        {
          id: "savings-wants",
          categoryId: "savings",
          name: "Wants",
          digital: Math.round(savingsBudget * 0.35) - 1000,
          cash: 0,
          allocated: Math.round(savingsBudget * 0.35) - 1000,
        },
      ],
    },
    {
      id: "liabilities",
      name: "Liabilities",
      tag: "Liabilities",
      percentage: 30,
      subcategories: [
        {
          id: "liabilities-rent",
          categoryId: "liabilities",
          name: "Rent",
          digital: Math.round(liabilitiesBudget * 0.8),
          cash: 0,
          allocated: Math.round(liabilitiesBudget * 0.8),
        },
        {
          id: "liabilities-electricity",
          categoryId: "liabilities",
          name: "Electricity",
          digital: Math.round(liabilitiesBudget * 0.2),
          cash: 500,
          allocated: Math.round(liabilitiesBudget * 0.2) + 500,
        },
      ],
    },
    {
      id: "expenses",
      name: "Expenses",
      tag: "Expenses",
      percentage: 40,
      subcategories: [
        {
          id: "expenses-food",
          categoryId: "expenses",
          name: "Food",
          digital: Math.round(expensesBudget * 0.5),
          cash: 1500,
          allocated: Math.round(expensesBudget * 0.5) + 1500,
        },
        {
          id: "expenses-transpo",
          categoryId: "expenses",
          name: "Transpo",
          digital: Math.round(expensesBudget * 0.3),
          cash: 500,
          allocated: Math.round(expensesBudget * 0.3) + 500,
        },
        {
          id: "expenses-clothes",
          categoryId: "expenses",
          name: "Clothes",
          digital: Math.round(expensesBudget * 0.2) - 2000,
          cash: 0,
          allocated: Math.round(expensesBudget * 0.2) - 2000,
        },
      ],
    },
  ];
}

export function calculateAllocations(income: number, categories: MainCategory[]) {
  const safeIncome = Number.isFinite(income) && income > 0 ? income : 0;
  const result: Record<string, number> = {};

  for (const cat of categories) {
    result[cat.id] = Math.round(safeIncome * (cat.percentage / 100));
  }

  return result;
}

export function addIncomeToCategories(categories: MainCategory[], income: number): MainCategory[] {
  const safeIncome = Number.isFinite(income) && income > 0 ? income : 0;
  if (safeIncome <= 0) return categories;

  return categories.map((cat) => {
    const catAllocation = Math.round(safeIncome * (cat.percentage / 100));
    const subCount = cat.subcategories.length;
    if (subCount === 0) return cat;

    const perSubAllocation = Math.floor(catAllocation / subCount);
    const remainder = catAllocation - perSubAllocation * subCount;

    const newSubs = cat.subcategories.map((sub, idx) => {
      const addition = perSubAllocation + (idx === 0 ? remainder : 0);
      return {
        ...sub,
        digital: sub.digital + addition,
        allocated: sub.allocated + addition,
      };
    });

    return { ...cat, subcategories: newSubs };
  });
}

export function addExpenseToCategories(
  categories: MainCategory[],
  subCategoryId: string,
  amount: number,
  source: "digital" | "cash",
): MainCategory[] {
  const safeAmount = Number.isFinite(amount) && amount > 0 ? Math.round(amount) : 0;
  if (safeAmount <= 0) return categories;

  return categories.map((cat) => {
    const hasSub = cat.subcategories.some((s) => s.id === subCategoryId);
    if (!hasSub) return cat;

    const updatedSubs = cat.subcategories.map((sub) => {
      if (sub.id !== subCategoryId) return sub;
      if (source === "digital") {
        const newDigital = Math.max(0, sub.digital - safeAmount);
        return { ...sub, digital: newDigital };
      } else {
        const newCash = Math.max(0, sub.cash - safeAmount);
        return { ...sub, cash: newCash };
      }
    });

    return { ...cat, subcategories: updatedSubs };
  });
}

export function transferBetweenCashDigital(
  categories: MainCategory[],
  subCategoryId: string,
  amount: number,
  direction: "to-cash" | "to-digital",
): MainCategory[] {
  const safeAmount = Number.isFinite(amount) && amount > 0 ? Math.round(amount) : 0;
  if (safeAmount <= 0) return categories;

  return categories.map((cat) => {
    const hasSub = cat.subcategories.some((s) => s.id === subCategoryId);
    if (!hasSub) return cat;

    const updatedSubs = cat.subcategories.map((sub) => {
      if (sub.id !== subCategoryId) return sub;

      if (direction === "to-cash") {
        const transferable = Math.min(safeAmount, sub.digital);
        return {
          ...sub,
          digital: sub.digital - transferable,
          cash: sub.cash + transferable,
        };
      } else {
        const transferable = Math.min(safeAmount, sub.cash);
        return {
          ...sub,
          digital: sub.digital + transferable,
          cash: sub.cash - transferable,
        };
      }
    });

    return { ...cat, subcategories: updatedSubs };
  });
}

export function transferBetweenSubStashes(
  categories: MainCategory[],
  fromSubId: string,
  toSubId: string,
  amount: number,
  source: "digital" | "cash",
): MainCategory[] {
  const safeAmount = Number.isFinite(amount) && amount > 0 ? Math.round(amount) : 0;
  if (safeAmount <= 0 || fromSubId === toSubId) return categories;

  // First step: deduct from source sub-stash
  let step1 = categories.map((cat) => {
    const hasSub = cat.subcategories.some((s) => s.id === fromSubId);
    if (!hasSub) return cat;

    return {
      ...cat,
      subcategories: cat.subcategories.map((sub) => {
        if (sub.id !== fromSubId) return sub;
        if (source === "digital") {
          const transferable = Math.min(safeAmount, sub.digital);
          return { ...sub, digital: sub.digital - transferable };
        } else {
          const transferable = Math.min(safeAmount, sub.cash);
          return { ...sub, cash: sub.cash - transferable };
        }
      }),
    };
  });

  // Second step: add to target sub-stash (into digital or cash matching source)
  let step2 = step1.map((cat) => {
    const hasSub = cat.subcategories.some((s) => s.id === toSubId);
    if (!hasSub) return cat;

    return {
      ...cat,
      subcategories: cat.subcategories.map((sub) => {
        if (sub.id !== toSubId) return sub;
        if (source === "digital") {
          return { ...sub, digital: sub.digital + safeAmount };
        } else {
          return { ...sub, cash: sub.cash + safeAmount };
        }
      }),
    };
  });

  return step2;
}

export function updateCategoryPercentages(
  categories: MainCategory[],
  newPercentages: Record<string, number>,
): MainCategory[] {
  return categories.map((cat) => ({
    ...cat,
    percentage: newPercentages[cat.id] ?? cat.percentage,
  }));
}

export function addSubCategoryToCategory(
  categories: MainCategory[],
  categoryId: string,
  subName: string,
): MainCategory[] {
  const trimmed = subName.trim();
  if (!trimmed) return categories;

  const newId = `${categoryId}-${Date.now()}`;

  return categories.map((cat) => {
    if (cat.id !== categoryId) return cat;

    const newSub: SubCategory = {
      id: newId,
      categoryId: cat.id,
      name: trimmed,
      digital: 0,
      cash: 0,
      allocated: 0,
    };

    return {
      ...cat,
      subcategories: [...cat.subcategories, newSub],
    };
  });
}

export function renameSubCategory(
  categories: MainCategory[],
  subCategoryId: string,
  newName: string,
): MainCategory[] {
  const trimmed = newName.trim();
  if (!trimmed) return categories;

  return categories.map((cat) => ({
    ...cat,
    subcategories: cat.subcategories.map((sub) =>
      sub.id === subCategoryId ? { ...sub, name: trimmed } : sub,
    ),
  }));
}

export function deleteSubCategory(
  categories: MainCategory[],
  subCategoryId: string,
): MainCategory[] {
  return categories.map((cat) => ({
    ...cat,
    subcategories: cat.subcategories.filter((sub) => sub.id !== subCategoryId),
  }));
}

export function getAllSubcategories(categories: MainCategory[]): SubCategory[] {
  return categories.flatMap((c) => c.subcategories);
}

export function getCategoryTotalBalance(cat: MainCategory): number {
  return cat.subcategories.reduce((acc, sub) => acc + sub.digital + sub.cash, 0);
}

export function getCategoryTotalDigital(cat: MainCategory): number {
  return cat.subcategories.reduce((acc, sub) => acc + sub.digital, 0);
}

export function getCategoryTotalCash(cat: MainCategory): number {
  return cat.subcategories.reduce((acc, sub) => acc + sub.cash, 0);
}

export function getCategoryTotalAllocated(cat: MainCategory): number {
  return cat.subcategories.reduce((acc, sub) => acc + sub.allocated, 0);
}

export function getTotalBalance(categories: MainCategory[]): number {
  return categories.reduce((acc, cat) => acc + getCategoryTotalBalance(cat), 0);
}

export function getTotalDigital(categories: MainCategory[]): number {
  return categories.reduce((acc, cat) => acc + getCategoryTotalDigital(cat), 0);
}

export function getTotalCash(categories: MainCategory[]): number {
  return categories.reduce((acc, cat) => acc + getCategoryTotalCash(cat), 0);
}

export function getAllocationTotals(categories: MainCategory[]) {
  const totals: Record<CategoryTag, number> = {
    Savings: 0,
    Liabilities: 0,
    Expenses: 0,
  };

  for (const cat of categories) {
    if (cat.tag in totals) {
      totals[cat.tag] += getCategoryTotalBalance(cat);
    }
  }

  return totals;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);
}
