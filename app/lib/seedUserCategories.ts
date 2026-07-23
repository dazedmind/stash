import { db } from "@/db";
import { categories, subcategories } from "@/db/schema";
import { generateId } from "@/app/lib/auth";

export async function seedUserDefaultCategories(userId: string) {
  const savingsCatId = generateId();
  const liabilitiesCatId = generateId();
  const expensesCatId = generateId();

  await db.insert(categories).values([
    {
      id: savingsCatId,
      userId,
      name: "Savings",
      tag: "Savings",
      percentage: 30,
      icon: "piggy",
    },
    {
      id: liabilitiesCatId,
      userId,
      name: "Liabilities",
      tag: "Liabilities",
      percentage: 30,
      icon: "lightning",
    },
    {
      id: expensesCatId,
      userId,
      name: "Expenses",
      tag: "Expenses",
      percentage: 40,
      icon: "receipt",
    },
  ]);

  await db.insert(subcategories).values([
    {
      id: generateId(),
      categoryId: savingsCatId,
      userId,
      name: "Needs",
      digital: 0,
      cash: 0,
      allocated: 0,
    },
    {
      id: generateId(),
      categoryId: savingsCatId,
      userId,
      name: "Wants",
      digital: 0,
      cash: 0,
      allocated: 0,
    },
    {
      id: generateId(),
      categoryId: liabilitiesCatId,
      userId,
      name: "Rent",
      digital: 0,
      cash: 0,
      allocated: 0,
    },
    {
      id: generateId(),
      categoryId: liabilitiesCatId,
      userId,
      name: "Electricity",
      digital: 0,
      cash: 0,
      allocated: 0,
    },
    {
      id: generateId(),
      categoryId: expensesCatId,
      userId,
      name: "Food",
      digital: 0,
      cash: 0,
      allocated: 0,
    },
    {
      id: generateId(),
      categoryId: expensesCatId,
      userId,
      name: "Transpo",
      digital: 0,
      cash: 0,
      allocated: 0,
    },
    {
      id: generateId(),
      categoryId: expensesCatId,
      userId,
      name: "Clothes",
      digital: 0,
      cash: 0,
      allocated: 0,
    },
  ]);
}
