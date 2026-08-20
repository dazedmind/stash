export type CategoryTag = "Savings" | "Liabilities" | "Expenses" | string;

export interface SubCategory {
  id: string;
  categoryId: string;
  name: string;
  digital: number;
  cash: number;
  allocated: number;
  isHidden?: boolean;
  isSafe?: boolean; // Safe tagging: no Subtract Expense button, only Transfer
  maxCap?: number; // 0 = uncapped
  overflowSubId?: string; // Target sub-stash ID to route overflow
  icon?: string;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: "monthly" | "yearly" | string;
  billingDate: string; // ISO date string
  icon: string;
}

export interface MainCategory {
  id: string;
  name: string;
  tag: CategoryTag;
  percentage: number;
  icon?: string;
  isSafe?: boolean; // Safe tagging on category level
  isHidden?: boolean; // Hidden from total balance
  showInHomescreen?: boolean;
  overflowSubId?: string; // Category-level overflow target sub-stash ID
  displayOrder?: number;
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
      isSafe: true,
      isHidden: false,
      displayOrder: 0,
      subcategories: [
        {
          id: "savings-needs",
          categoryId: "savings",
          name: "Needs",
          digital: 0,
          cash: 0,
          allocated: 0,
          isHidden: false,
          isSafe: true,
          maxCap: 0,
          icon: "piggy",
        },
        {
          id: "savings-wants",
          categoryId: "savings",
          name: "Wants",
          digital: 0,
          cash: 0,
          allocated: 0,
          isHidden: false,
          isSafe: false,
          maxCap: 0,
          icon: "bag",
        },
      ],
    },
    {
      id: "liabilities",
      name: "Liabilities",
      tag: "Liabilities",
      percentage: 30,
      icon: "lightning",
      isHidden: false,
      displayOrder: 1,
      subcategories: [
        {
          id: "liabilities-rent",
          categoryId: "liabilities",
          name: "Rent",
          digital: 0,
          cash: 0,
          allocated: 0,
          isHidden: false,
          icon: "rent",
        },
        {
          id: "liabilities-electricity",
          categoryId: "liabilities",
          name: "Electricity",
          digital: 0,
          cash: 0,
          allocated: 0,
          isHidden: false,
          icon: "lightning",
        },
      ],
    },
    {
      id: "expenses",
      name: "Expenses",
      tag: "Expenses",
      percentage: 40,
      icon: "receipt",
      isHidden: false,
      displayOrder: 2,
      subcategories: [
        {
          id: "expenses-food",
          categoryId: "expenses",
          name: "Food",
          digital: 0,
          cash: 0,
          allocated: 0,
          isHidden: false,
          icon: "food",
        },
        {
          id: "expenses-transpo",
          categoryId: "expenses",
          name: "Transpo",
          digital: 0,
          cash: 0,
          allocated: 0,
          isHidden: false,
          icon: "car",
        },
        {
          id: "expenses-clothes",
          categoryId: "expenses",
          name: "Clothes",
          digital: 0,
          cash: 0,
          allocated: 0,
          isHidden: false,
          icon: "bag",
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

export function computeSubStashAllocations(catAllocation: number, subs: SubCategory[]) {
  if (subs.length === 0) {
    return { subAllocations: {} as Record<string, number>, categoryOverflow: 0 };
  }

  const basePerSub = Math.floor(catAllocation / subs.length);
  const baseRemainder = catAllocation - basePerSub * subs.length;

  let excessPool = 0;
  const currentAlloc: Record<string, number> = {};

  // Pass 1: Equal base split & cap check
  subs.forEach((sub, idx) => {
    const rawShare = basePerSub + (idx === 0 ? baseRemainder : 0);
    if (sub.maxCap && sub.maxCap > 0) {
      if (rawShare > sub.maxCap) {
        currentAlloc[sub.id] = sub.maxCap;
        excessPool += rawShare - sub.maxCap;
      } else {
        currentAlloc[sub.id] = rawShare;
      }
    } else {
      currentAlloc[sub.id] = rawShare;
    }
  });

  // Pass 2: Distribute excessPool to other sub-stashes in the same category that still have room under maxCap or are uncapped
  if (excessPool > 0) {
    const eligibleSubs = subs.filter((sub) => {
      if (!sub.maxCap || sub.maxCap <= 0) return true;
      return currentAlloc[sub.id] < sub.maxCap;
    });

    if (eligibleSubs.length > 0) {
      for (const sub of eligibleSubs) {
        if (excessPool <= 0) break;

        if (!sub.maxCap || sub.maxCap <= 0) {
          currentAlloc[sub.id] += excessPool;
          excessPool = 0;
        } else {
          const room = sub.maxCap - currentAlloc[sub.id];
          const fill = Math.min(room, excessPool);
          currentAlloc[sub.id] += fill;
          excessPool -= fill;
        }
      }
    }
  }

  return {
    subAllocations: currentAlloc,
    categoryOverflow: excessPool,
  };
}

export function addIncomeToCategories(
  categories: MainCategory[],
  income: number,
  globalOverflowSubId?: string
): MainCategory[] {
  const safeIncome = Number.isFinite(income) && income > 0 ? income : 0;
  if (safeIncome <= 0) return categories;

  let totalOverflowPool = 0;

  // Step 1: Calculate sub-stash allocations per category and collect true category overflow
  const categoriesWithInitialAllocations = categories.map((cat) => {
    const catAllocation = Math.round(safeIncome * (cat.percentage / 100));
    const subs = cat.subcategories;

    if (subs.length === 0) {
      return {
        cat,
        subAllocations: [
          { subId: `${cat.id}-general`, amount: catAllocation },
        ],
      };
    }

    const { subAllocations, categoryOverflow } = computeSubStashAllocations(catAllocation, subs);
    totalOverflowPool += categoryOverflow;

    const formattedSubAllocations = subs.map((sub) => ({
      subId: sub.id,
      amount: subAllocations[sub.id] || 0,
    }));

    return { cat, subAllocations: formattedSubAllocations };
  });

  // Step 2: Route totalOverflowPool to globalOverflowSubId or uncapped sub-stash
  if (totalOverflowPool > 0) {
    let targetSubId = globalOverflowSubId;

    let foundTarget = false;
    if (targetSubId) {
      foundTarget = categoriesWithInitialAllocations.some((c) =>
        c.subAllocations.some((s) => s.subId === targetSubId)
      );
    }

    if (!foundTarget) {
      const uncappedSub = categories
        .flatMap((c) => c.subcategories)
        .find((s) => !s.maxCap || s.maxCap <= 0);

      if (uncappedSub) {
        targetSubId = uncappedSub.id;
        foundTarget = true;
      }
    }

    if (targetSubId) {
      for (const item of categoriesWithInitialAllocations) {
        const targetAlloc = item.subAllocations.find((s) => s.subId === targetSubId);
        if (targetAlloc) {
          targetAlloc.amount += totalOverflowPool;
          break;
        }
      }
    }
  }

  // Step 3: Produce updated MainCategory list with net balances
  return categoriesWithInitialAllocations.map(({ cat, subAllocations }) => {
    if (cat.subcategories.length === 0) {
      const alloc = subAllocations[0];
      const newSub: SubCategory = {
        id: alloc.subId,
        categoryId: cat.id,
        name: "General",
        digital: alloc.amount,
        cash: 0,
        allocated: alloc.amount,
        isHidden: false,
        icon: "wallet",
      };
      return { ...cat, subcategories: [newSub] };
    }

    const updatedSubs = cat.subcategories.map((sub) => {
      const alloc = subAllocations.find((s) => s.subId === sub.id);
      const addition = alloc ? alloc.amount : 0;
      return {
        ...sub,
        digital: sub.digital + addition,
        allocated: sub.allocated + addition,
      };
    });

    return { ...cat, subcategories: updatedSubs };
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

export function updateSubCategoryIconInCategories(
  categories: MainCategory[],
  subCategoryId: string,
  icon: string
): MainCategory[] {
  return categories.map((cat) => ({
    ...cat,
    subcategories: cat.subcategories.map((sub) =>
      sub.id === subCategoryId ? { ...sub, icon } : sub
    ),
  }));
}

export function updateCategorySettingsInCategories(
  categories: MainCategory[],
  categoryId: string,
  settings: Partial<MainCategory>
): MainCategory[] {
  return categories.map((cat) =>
    cat.id === categoryId ? { ...cat, ...settings } : cat
  );
}

export function deleteCategoryFromCategories(
  categories: MainCategory[],
  categoryId: string
): MainCategory[] {
  return categories.filter((cat) => cat.id !== categoryId);
}

export function updateSubCategorySettingsInCategories(
  categories: MainCategory[],
  subCategoryId: string,
  settings: Partial<SubCategory>
): MainCategory[] {
  return categories.map((cat) => ({
    ...cat,
    subcategories: cat.subcategories.map((sub) =>
      sub.id === subCategoryId ? { ...sub, ...settings } : sub
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
  icon: string = "wallet"
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
      isSafe: false,
      maxCap: 0,
      icon,
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
  return categories
    .filter((cat) => !cat.isHidden)
    .reduce((acc, cat) => acc + getCategoryVisibleTotalBalance(cat), 0);
}

export function getTotalDigital(categories: MainCategory[]): number {
  return categories
    .filter((cat) => !cat.isHidden)
    .reduce(
      (acc, cat) =>
        acc +
        cat.subcategories
          .filter((sub) => !sub.isHidden)
          .reduce((sum, sub) => sum + sub.digital, 0),
      0
    );
}

export function getTotalCash(categories: MainCategory[]): number {
  return categories
    .filter((cat) => !cat.isHidden)
    .reduce(
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
