import { db } from "@/db";
import { categories as categoriesTable, subcategories, transactions, users } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { generateId, getAuthenticatedUser } from "@/app/lib/auth";
import { computeSubStashAllocations } from "@/app/lib/finance";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const amount = Number.parseInt(body.amount, 10);
    const subCategoryId = body.subCategoryId; // optional specific sub-stash
    const globalOverflowSubId = body.globalOverflowSubId;

    if (!Number.isFinite(amount) || amount <= 0) {
      return Response.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Update user's total income received
    await db
      .update(users)
      .set({
        totalIncomeReceived: sql`${users.totalIncomeReceived} + ${amount}`,
      })
      .where(eq(users.id, user.id));

    // If specific sub-stash requested (manual deposit)
    if (subCategoryId) {
      const existingSub = await db
        .select()
        .from(subcategories)
        .where(and(eq(subcategories.id, subCategoryId), eq(subcategories.userId, user.id)));

      if (!existingSub.length) {
        return Response.json({ error: "Target sub-stash not found" }, { status: 404 });
      }

      const targetSub = existingSub[0];

      await db
        .update(subcategories)
        .set({
          digital: sql`${subcategories.digital} + ${amount}`,
          allocated: sql`${subcategories.allocated} + ${amount}`,
        })
        .where(eq(subcategories.id, targetSub.id));

      const detailsObj = { [targetSub.name]: amount };

      await db.insert(transactions).values({
        id: generateId(),
        userId: user.id,
        subCategoryId: targetSub.id,
        type: "income",
        amount,
        source: "digital",
        description: `Income added to ${targetSub.name}`,
        details: JSON.stringify(detailsObj),
      });

      return Response.json({ success: true, details: detailsObj });
    }

    // Auto-allocate across categories (default mode)
    let userCategories = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.userId, user.id));

    if (userCategories.length === 0) {
      return Response.json({ error: "No categories found" }, { status: 400 });
    }

    let totalOverflowPool = 0;
    const categorySubAllocations: { catId: string; subId: string; addition: number }[] = [];

    // Step 1: Compute sub-stash allocations per category and collect true category overflow
    for (const cat of userCategories) {
      const catAllocation = Math.round(amount * (cat.percentage / 100));

      let catSubs = await db
        .select()
        .from(subcategories)
        .where(and(eq(subcategories.categoryId, cat.id), eq(subcategories.userId, user.id)));

      if (catSubs.length === 0) {
        const genSubId = generateId();
        await db.insert(subcategories).values({
          id: genSubId,
          categoryId: cat.id,
          userId: user.id,
          name: "General",
          digital: catAllocation,
          cash: 0,
          allocated: catAllocation,
        });
        continue;
      }

      const { subAllocations, categoryOverflow } = computeSubStashAllocations(
        catAllocation,
        catSubs.map((s) => ({
          ...s,
          isHidden: Boolean(s.isHidden),
          isSafe: Boolean(s.isSafe),
          maxCap: s.maxCap || 0,
          overflowSubId: s.overflowSubId || undefined,
        }))
      );

      totalOverflowPool += categoryOverflow;

      catSubs.forEach((sub) => {
        const addition = subAllocations[sub.id] || 0;
        categorySubAllocations.push({ catId: cat.id, subId: sub.id, addition });
      });
    }

    // Step 2: Route totalOverflowPool to globalOverflowSubId or uncapped sub-stash
    if (totalOverflowPool > 0) {
      let targetSubId = globalOverflowSubId;

      let found = categorySubAllocations.find((item) => item.subId === targetSubId);
      if (!found && categorySubAllocations.length > 0) {
        targetSubId = categorySubAllocations[categorySubAllocations.length - 1].subId;
        found = categorySubAllocations.find((item) => item.subId === targetSubId);
      }

      if (found) {
        found.addition += totalOverflowPool;
      }
    }

    // Step 3: Persist all updated subcategory balances
    const breakdown: Record<string, number> = {};

    for (const allocItem of categorySubAllocations) {
      if (allocItem.addition > 0) {
        await db
          .update(subcategories)
          .set({
            digital: sql`${subcategories.digital} + ${allocItem.addition}`,
            allocated: sql`${subcategories.allocated} + ${allocItem.addition}`,
          })
          .where(eq(subcategories.id, allocItem.subId));

        breakdown[allocItem.subId] = allocItem.addition;
      }
    }

    await db.insert(transactions).values({
      id: generateId(),
      userId: user.id,
      type: "income",
      amount,
      source: "digital",
      description: `Income Deposit (${userCategories.length} categories split)`,
      details: JSON.stringify(breakdown),
    });

    return Response.json({ success: true, details: breakdown });
  } catch (error) {
    console.error("Income API error:", error);
    return Response.json({ error: "Failed to process income deposit" }, { status: 500 });
  }
}
