import { db } from "@/db";
import { subcategories, transactions } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { generateId } from "@/app/lib/auth";

export async function POST(req: Request) {
  try {
    // ─────────────────────────────────────────
    // Shortcut authentication
    // ─────────────────────────────────────────

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

    // Your Stash user ID
    const userId = process.env.SHORTCUT_USER_ID;

    if (!userId) {
      console.error("SHORTCUT_USER_ID is not configured");

      return Response.json(
        { error: "Shortcut authentication is not configured" },
        { status: 500 }
      );
    }

    // ─────────────────────────────────────────
    // Request body
    // ─────────────────────────────────────────

    const body = await req.json();

    const {
      subCategoryId,
      source,
      note,
      tag,
    } = body;

    const amount = Number.parseInt(body.amount, 10);

    if (
      !subCategoryId ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return Response.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }

    // ─────────────────────────────────────────
    // Make sure the subcategory belongs to you
    // ─────────────────────────────────────────

    const existingSub = await db
      .select()
      .from(subcategories)
      .where(
        and(
          eq(subcategories.id, subCategoryId),
          eq(subcategories.userId, userId)
        )
      );

    if (!existingSub.length) {
      return Response.json(
        { error: "Subcategory not found" },
        { status: 404 }
      );
    }

    const sub = existingSub[0];

    // ─────────────────────────────────────────
    // Deduct balance
    // ─────────────────────────────────────────

    const isDigital = source === "digital";

    if (isDigital) {
      const newDigital = Math.max(
        0,
        sub.digital - amount
      );

      await db
        .update(subcategories)
        .set({
          digital: newDigital,
        })
        .where(
          eq(subcategories.id, sub.id)
        );
    } else {
      const newCash = Math.max(
        0,
        sub.cash - amount
      );

      await db
        .update(subcategories)
        .set({
          cash: newCash,
        })
        .where(
          eq(subcategories.id, sub.id)
        );
    }

    // ─────────────────────────────────────────
    // Create transaction
    // ─────────────────────────────────────────

    const description =
      typeof note === "string" && note.trim()
        ? note.trim()
        : "";

    const details = JSON.stringify({
      tag: tag || "other",
      note: description,
    });

    await db.insert(transactions).values({
      id: generateId(),
      userId,
      subCategoryId: sub.id,
      type: "expense",
      amount,
      source: isDigital ? "digital" : "cash",
      description,
      details,
    });

    return Response.json({
      success: true,
    });

  } catch (error) {
    console.error(
      "Shortcut expense API error:",
      error
    );

    return Response.json(
      { error: "Failed to process expense" },
      { status: 500 }
    );
  }
}