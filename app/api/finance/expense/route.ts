import { db } from "@/db";
import { subcategories, transactions } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { generateId, getAuthenticatedUser } from "@/app/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { subCategoryId, source, note } = body;
    const amount = Number.parseInt(body.amount, 10);

    if (!subCategoryId || !Number.isFinite(amount) || amount <= 0) {
      return Response.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const existingSub = await db
      .select()
      .from(subcategories)
      .where(and(eq(subcategories.id, subCategoryId), eq(subcategories.userId, user.id)));

    if (!existingSub.length) {
      return Response.json({ error: "Subcategory not found" }, { status: 404 });
    }

    const sub = existingSub[0];
    const isDigital = source === "digital";

    if (isDigital) {
      const newDigital = Math.max(0, sub.digital - amount);
      await db
        .update(subcategories)
        .set({ digital: newDigital })
        .where(eq(subcategories.id, sub.id));
    } else {
      const newCash = Math.max(0, sub.cash - amount);
      await db
        .update(subcategories)
        .set({ cash: newCash })
        .where(eq(subcategories.id, sub.id));
    }

    const description = note?.trim() ? note.trim() : '';

    await db.insert(transactions).values({
      id: generateId(),
      userId: user.id,
      subCategoryId: sub.id,
      type: "expense",
      amount,
      source: isDigital ? "digital" : "cash",
      description,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Expense API error:", error);
    return Response.json({ error: "Failed to process expense" }, { status: 500 });
  }
}
