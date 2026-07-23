export type CategoryTag = "Savings" | "Liabilities" | "Expenses" | string;

export interface SubCategory {
  id: string;
  categoryId: string;
  name: string;
  digital: number;
  cash: number;
  allocated: number;
  isHidden?: boolean;
}

export interface MainCategory {
  id: string;
  name: string;
  tag: CategoryTag;
  percentage: number;
  icon?: string;
  subcategories: SubCategory[];
}

export const DEFAULT_ALLOCATION_RULE: Record<string, number> = {
  Savings: 30,
  Liabilities: 30,
  Expenses: 40,
};

export function buildInitialMainCategories(): MainCategory[] {
  return [
    {
      id: "savings",
      name: "Savings",
      tag: "Savings",
      percentage: 30,
      icon: "piggy",
      subcategories: [
        {
          id: "savings-needs",
          categoryId: "savings",
          name: "Needs",
          digital: 0,
          cash: 0,
          allocated: 0,
          isHidden: false,
        },
        {
          id: "savings-wants",
          categoryId: "savings",
          name: "Wants",
          digital: 0,
          cash: 0,
          allocated: 0,
          isHidden: false,
        },
      ],
    },
    {
      id: "liabilities",
      name: "Liabilities",
      tag: "Liabilities",
      percentage: 30,
      icon: "lightning",
      subcategories: [
        {
          id: "liabilities-rent",
          categoryId: "liabilities",
          name: "Rent",
          digital: 0,
          cash: 0,
          allocated: 0,
          isHidden: false,
        },
        {
          id: "liabilities-electricity",
          categoryId: "liabilities",
          name: "Electricity",
          digital: 0,
          cash: 0,
          allocated: 0,
          isHidden: false,
        },
      ],
    },
    {
      id: "expenses",
      name: "Expenses",
      tag: "Expenses",
      percentage: 40,
      icon: "receipt",
      subcategories: [
        {
          id: "expenses-food",
          categoryId: "expenses",
          name: "Food",
          digital: 0,
          cash: 0,
          allocated: 0,
          isHidden: false,
        },
        {
          id: "expenses-transpo",
          categoryId: "expenses",
          name: "Transpo",
          digital: 0,
          cash: 0,
          allocated: 0,
          isHidden: false,
        },
        {
          id: "expenses-clothes",
          categoryId: "expenses",
          name: "Clothes",
          digital: 0,
          cash: 0,
          allocated: 0,
          isHidden: false,
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
    result[cat.name] = Math.round(safeIncome * (cat.percentage / 100));
  }

  return result;
}

export function addIncomeToCategories(categories: MainCategory[], income: number): MainCategory[] {
  const safeIncome = Number.isFinite(income) && income > 0 ? income : 0;
  if (safeIncome <= 0) return categories;

  return categories.map((cat) => {
    const catAllocation = Math.round(safeIncome * (cat.percentage / 100));
    const subs = cat.subcategories;

    if (subs.length === 0) {
      const newSub: SubCategory = {
        id: `${cat.id}-general`,
        categoryId: cat.id,
        name: "General",
        digital: catAllocation,
        cash: 0,
        allocated: catAllocation,
        isHidden: false,
      };
      return { ...cat, subcategories: [newSub] };
    }

    const perSubAllocation = Math.floor(catAllocation / subs.length);
    const remainder = catAllocation - perSubAllocation * subs.length;

    const newSubs = subs.map((sub, idx) => {
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

export function toggleHideSubCategoryInCategories(
  categories: MainCategory[],
  subCategoryId: string
): MainCategory[] {
  return categories.map((cat) => ({
    ...cat,
    subcategories: cat.subcategories.map((sub) =>
      sub.id === subCategoryId ? { ...sub, isHidden: !sub.isHidden } : sub
    ),
  }));
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
      isHidden: false,
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

export function getCategoryVisibleTotalBalance(cat: MainCategory): number {
  return cat.subcategories
    .filter((sub) => !sub.isHidden)
    .reduce((acc, sub) => acc + sub.digital + sub.cash, 0);
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

// Excludes hidden stashes from Total Balance calculation
export function getTotalBalance(categories: MainCategory[]): number {
  return categories.reduce((acc, cat) => acc + getCategoryVisibleTotalBalance(cat), 0);
}

export function getTotalDigital(categories: MainCategory[]): number {
  return categories.reduce(
    (acc, cat) =>
      acc +
      cat.subcategories
        .filter((sub) => !sub.isHidden)
        .reduce((sum, sub) => sum + sub.digital, 0),
    0
  );
}

export function getTotalCash(categories: MainCategory[]): number {
  return categories.reduce(
    (acc, cat) =>
      acc +
      cat.subcategories
        .filter((sub) => !sub.isHidden)
        .reduce((sum, sub) => sum + sub.cash, 0),
    0
  );
}

export function getAllocationTotals(categories: MainCategory[]) {
  const totals: Record<string, number> = {};

  for (const cat of categories) {
    const total = getCategoryVisibleTotalBalance(cat);
    totals[cat.id] = total;
    totals[cat.name] = total;
    totals[cat.tag] = total;
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
