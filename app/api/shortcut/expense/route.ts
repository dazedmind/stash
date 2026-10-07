import { db } from "@/db";
import { subcategories, transactions } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { generateId } from "@/app/lib/auth";

export async function POST(req: Request) {
  try {
    // 1. Verify Shortcut secret
    const shortcutSecret = req.headers.get("x-shortcut-secret");

    if (
      !shortcutSecret ||
      shortcutSecret !== process.env.SHORTCUT_SECRET
    ) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Get the Stash user associated with this Shortcut
    const userId = process.env.SHORTCUT_USER_ID;

    if (!userId) {
      console.error("SHORTCUT_USER_ID is not configured");

      return Response.json(
        { error: "Shortcut authentication is not configured" },
        { status: 500 }
      );
    }

    // 3. Parse request body
    const body = await req.json();

    const {
      amount,
      subCategoryId,
      source,
      note,
      tag,
    } = body;

    const parsedAmount = Number(amount);

    if (
      !subCategoryId ||
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0
    ) {
      return Response.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }

    const expenseAmount = Math.round(parsedAmount);

    // 4. Make sure the subcategory belongs to this user
    const [subCategory] = await db
      .select()
      .from(subcategories)
      .where(
        and(
          eq(subcategories.id, subCategoryId),
          eq(subcategories.userId, userId)
        )
      )
      .limit(1);

    if (!subCategory) {
      return Response.json(
        { error: "Subcategory not found" },
        { status: 404 }
      );
    }

    // 5. Determine source
    const expenseSource =
      source === "cash" ? "cash" : "digital";

    // 6. Check balance
    const currentBalance =
      expenseSource === "cash"
        ? subCategory.cash
        : subCategory.digital;

    if (currentBalance < expenseAmount) {
      return Response.json(
        {
          error: "Insufficient balance",
          available: currentBalance,
          requested: expenseAmount,
        },
        { status: 400 }
      );
    }

    // 7. Deduct from the correct balance
    if (expenseSource === "cash") {
      await db
        .update(subcategories)
        .set({
          cash: currentBalance - expenseAmount,
        })
        .where(eq(subcategories.id, subCategoryId));
    } else {
      await db
        .update(subcategories)
        .set({
          digital: currentBalance - expenseAmount,
        })
        .where(eq(subcategories.id, subCategoryId));
    }

    // 8. Create transaction
    const description =
      typeof note === "string" ? note.trim() : "";

    const details = JSON.stringify({
      tag: tag || "other",
      note: description,
    });

    await db.insert(transactions).values({
      id: generateId(),
      userId,
      subCategoryId,
      type: "expense",
      amount: expenseAmount,
      source: expenseSource,
      description,
      details,
    });

    // 9. Success
    return Response.json({
      success: true,
      amount: expenseAmount,
      source: expenseSource,
      subCategoryId,
    });

  } catch (error) {
    console.error("Shortcut expense error:", error);

    return Response.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}