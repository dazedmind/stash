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
    const { transferType, subCategoryId, direction, fromSubId, toSubId, source } = body;
    const amount = Number.parseInt(body.amount, 10);

    if (!Number.isFinite(amount) || amount <= 0) {
      return Response.json({ error: "Invalid amount" }, { status: 400 });
    }

    if (transferType === "internal") {
      if (!subCategoryId) {
        return Response.json({ error: "Subcategory required" }, { status: 400 });
      }

      const existing = await db
        .select()
        .from(subcategories)
        .where(and(eq(subcategories.id, subCategoryId), eq(subcategories.userId, user.id)));

      if (!existing.length) {
        return Response.json({ error: "Subcategory not found" }, { status: 404 });
      }

      const sub = existing[0];
      if (direction === "to-cash") {
        const transferable = Math.min(amount, sub.digital);
        await db
          .update(subcategories)
          .set({
            digital: sub.digital - transferable,
            cash: sub.cash + transferable,
          })
          .where(eq(subcategories.id, sub.id));
      } else {
        const transferable = Math.min(amount, sub.cash);
        await db
          .update(subcategories)
          .set({
            digital: sub.digital + transferable,
            cash: sub.cash - transferable,
          })
          .where(eq(subcategories.id, sub.id));
      }

      await db.insert(transactions).values({
        id: generateId(),
        userId: user.id,
        subCategoryId: sub.id,
        type: "transfer_internal",
        amount,
        source: direction === "to-cash" ? "digital_to_cash" : "cash_to_digital",
        description: `Internal transfer for ${sub.name}`,
      });

      return Response.json({ success: true });
    } else {
      // Between sub-stashes
      if (!fromSubId || !toSubId || fromSubId === toSubId) {
        return Response.json({ error: "Invalid source or target subcategory" }, { status: 400 });
      }

      const fromList = await db
        .select()
        .from(subcategories)
        .where(and(eq(subcategories.id, fromSubId), eq(subcategories.userId, user.id)));

      const toList = await db
        .select()
        .from(subcategories)
        .where(and(eq(subcategories.id, toSubId), eq(subcategories.userId, user.id)));

      if (!fromList.length || !toList.length) {
        return Response.json({ error: "Subcategories not found" }, { status: 404 });
      }

      const fromSub = fromList[0];
      const toSub = toList[0];
      const isDigital = source === "digital";

      if (isDigital) {
        const transferable = Math.min(amount, fromSub.digital);
        await db
          .update(subcategories)
          .set({ digital: fromSub.digital - transferable })
          .where(eq(subcategories.id, fromSub.id));

        await db
          .update(subcategories)
          .set({ digital: toSub.digital + transferable })
          .where(eq(subcategories.id, toSub.id));
      } else {
        const transferable = Math.min(amount, fromSub.cash);
        await db
          .update(subcategories)
          .set({ cash: fromSub.cash - transferable })
          .where(eq(subcategories.id, fromSub.id));

        await db
          .update(subcategories)
          .set({ cash: toSub.cash + transferable })
          .where(eq(subcategories.id, toSub.id));
      }

      await db.insert(transactions).values({
        id: generateId(),
        userId: user.id,
        type: "transfer_sub",
        amount,
        source: isDigital ? "digital" : "cash",
        description: `${fromSub.name} to ${toSub.name}`,
      });

      return Response.json({ success: true });
    }
  } catch (error) {
    console.error("Transfer API error:", error);
    return Response.json({ error: "Failed to process transfer" }, { status: 500 });
  }
}
