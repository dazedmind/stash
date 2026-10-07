import { db } from "@/db";
import { categories, subcategories, subscriptions, transactions } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { generateId } from "@/app/lib/auth";

export function advanceBillingDate(date: Date, cycle: string): Date {
  const next = new Date(date);
  const normalizedCycle = (cycle || "monthly").toLowerCase();

  if (normalizedCycle === "yearly") {
    const origDay = date.getUTCDate();
    const origMonth = date.getUTCMonth();
    next.setUTCFullYear(next.getUTCFullYear() + 1);
    if (next.getUTCMonth() !== origMonth) {
      next.setUTCDate(0); // Clamps to end of Feb (Feb 28)
    }
  } else if (normalizedCycle === "weekly") {
    next.setUTCDate(next.getUTCDate() + 7);
  } else if (normalizedCycle === "daily") {
    next.setUTCDate(next.getUTCDate() + 1);
  } else {
    // Default: monthly
    const origDay = date.getUTCDate();
    next.setUTCDate(1);
    next.setUTCMonth(next.getUTCMonth() + 1);
    const daysInNextMonth = new Date(
      Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + 1, 0)
    ).getUTCDate();
    next.setUTCDate(Math.min(origDay, daysInNextMonth));
  }

  return next;
}

export function isSubscriptionDue(
  billingDate: Date,
  clientLocalDate?: string | null
): boolean {
  const subDateStr = billingDate.toISOString().slice(0, 10);

  // If client's local date (YYYY-MM-DD) is provided, prioritize comparing calendar dates
  if (clientLocalDate && /^\d{4}-\d{2}-\d{2}$/.test(clientLocalDate)) {
    return subDateStr <= clientLocalDate;
  }

  // Fallback to server date check
  const now = new Date();
  const todayUtcStr = now.toISOString().slice(0, 10);
  if (subDateStr <= todayUtcStr) {
    return true;
  }

  return billingDate.getTime() <= now.getTime();
}

export interface ProcessSubscriptionsResult {
  processedCount: number;
  totalDeducted: number;
}

export async function processDueSubscriptions(
  userId: string,
  requestedOverflowSubId?: string | null,
  clientLocalDate?: string | null
): Promise<ProcessSubscriptionsResult> {
  let processedCount = 0;
  let totalDeducted = 0;

  try {
    // 1. Fetch user subscriptions
    const userSubs = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));

    if (!userSubs.length) {
      return { processedCount: 0, totalDeducted: 0 };
    }

    // 2. Fetch user subcategories to resolve default overflow target stash
    const userSubcategories = await db
      .select()
      .from(subcategories)
      .where(eq(subcategories.userId, userId));

    if (!userSubcategories.length) {
      return { processedCount: 0, totalDeducted: 0 };
    }

    // 3. Resolve target stash:
    // Priority 1: User's selected global overflow sub-stash ID (if passed and valid)
    let targetSub = requestedOverflowSubId
      ? userSubcategories.find((s) => s.id === requestedOverflowSubId)
      : undefined;

    // Priority 2: Subcategory with overflow configured or category overflow
    if (!targetSub) {
      const userCats = await db
        .select()
        .from(categories)
        .where(eq(categories.userId, userId));

      const catOverflowId = userCats.find((c) => c.overflowSubId)?.overflowSubId;
      if (catOverflowId) {
        targetSub = userSubcategories.find((s) => s.id === catOverflowId);
      }
    }

    // Priority 3: First non-safe subcategory
    if (!targetSub) {
      targetSub = userSubcategories.find((s) => !s.isSafe);
    }

    // Priority 4: Fallback to the first available subcategory
    if (!targetSub) {
      targetSub = userSubcategories[0];
    }

    // 4. Process each subscription
    for (const sub of userSubs) {
      let nextBillingDate = new Date(sub.billingDate);
      let cyclesProcessed = 0;
      const maxCycles = 24; // Safety cap

      while (cyclesProcessed < maxCycles) {
        if (!isSubscriptionDue(nextBillingDate, clientLocalDate)) {
          break;
        }

        // Deduct from target stash digital balance
        await db
          .update(subcategories)
          .set({
            digital: sql`${subcategories.digital} - ${sub.amount}`,
          })
          .where(and(eq(subcategories.id, targetSub.id), eq(subcategories.userId, userId)));

        // Insert uniform expense transaction
        const description = `Subscription: ${sub.name}`;
        await db.insert(transactions).values({
          id: generateId(),
          userId,
          subCategoryId: targetSub.id,
          type: "expense",
          amount: sub.amount,
          source: "digital",
          description,
          details: JSON.stringify({ note: description, tag: "bills" }),
          createdAt: new Date(),
        });

        totalDeducted += sub.amount;
        cyclesProcessed++;
        processedCount++;

        // Advance nextBillingDate for this subscription
        nextBillingDate = advanceBillingDate(nextBillingDate, sub.billingCycle);
      }

      // If any cycles were processed, update the subscription's billingDate in the database
      if (cyclesProcessed > 0) {
        await db
          .update(subscriptions)
          .set({
            billingDate: nextBillingDate,
          })
          .where(and(eq(subscriptions.id, sub.id), eq(subscriptions.userId, userId)));
      }
    }
  } catch (error) {
    console.error("Error in processDueSubscriptions:", error);
  }

  return { processedCount, totalDeducted };
}
