import { db } from "@/db";
import { categories, subcategories, transactions, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { generateId, getAuthenticatedUser } from "@/app/lib/auth";
import { seedUserDefaultCategories } from "@/app/lib/seedUserCategories";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const amount = Number.parseInt(body.amount, 10);

    if (!Number.isFinite(amount) || amount <= 0) {
      return Response.json({ error: "Invalid amount" }, { status: 400 });
    }

    // 1. Update user total income received
    await db
      .update(users)
      .set({
        totalIncomeReceived: sql`total_income_received + ${amount}`,
      })
      .where(eq(users.id, user.id));

    // 2. Fetch user categories
    let userCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.userId, user.id));

    if (userCategories.length === 0) {
      await seedUserDefaultCategories(user.id);
      userCategories = await db
        .select()
        .from(categories)
        .where(eq(categories.userId, user.id));
    }

    const userSubcategories = await db
      .select()
      .from(subcategories)
      .where(eq(subcategories.userId, user.id));

    const allocationBreakdown: Record<string, number> = {};

    // 3. Distribute income across EVERY category according to percentage
    for (const cat of userCategories) {
      const catAllocation = Math.round(amount * (cat.percentage / 100));
      allocationBreakdown[cat.name] = catAllocation;

      const subs = userSubcategories.filter((s) => s.categoryId === cat.id);

      if (subs.length === 0) {
        // If category has no subcategories yet, create a default "General" sub-stash
        await db.insert(subcategories).values({
          id: generateId(),
          categoryId: cat.id,
          userId: user.id,
          name: "General",
          digital: catAllocation,
          cash: 0,
          allocated: catAllocation,
        });
      } else {
        const perSubAllocation = Math.floor(catAllocation / subs.length);
        const remainder = catAllocation - perSubAllocation * subs.length;

        for (let idx = 0; idx < subs.length; idx++) {
          const sub = subs[idx];
          const addition = perSubAllocation + (idx === 0 ? remainder : 0);

          await db
            .update(subcategories)
            .set({
              digital: sql`digital + ${addition}`,
              allocated: sql`allocated + ${addition}`,
            })
            .where(eq(subcategories.id, sub.id));
        }
      }
    }

    // 4. Record transaction log with breakdown details
    await db.insert(transactions).values({
      id: generateId(),
      userId: user.id,
      type: "income",
      amount,
      source: "digital",
      description: "Income deposit",
      details: JSON.stringify(allocationBreakdown),
    });

    return Response.json({ success: true, breakdown: allocationBreakdown });
  } catch (error) {
    console.error("Income API error:", error);
    return Response.json({ error: "Failed to process income" }, { status: 500 });
  }
}
