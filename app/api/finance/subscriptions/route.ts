import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { generateId, getAuthenticatedUser } from "@/app/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, user.id));

    return Response.json({ subscriptions: data });
  } catch (error) {
    console.error("Fetch subscriptions error:", error);
    return Response.json({ error: "Failed to fetch subscriptions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, amount, billingCycle, billingDate, icon } = body;

    const trimmedName = name?.trim();
    if (!trimmedName || !amount || !billingDate) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newId = generateId();
    await db.insert(subscriptions).values({
      id: newId,
      userId: user.id,
      name: trimmedName,
      amount: Number.parseInt(String(amount), 10) || 0,
      billingCycle: billingCycle || "monthly",
      billingDate: new Date(billingDate),
      icon: icon || "credit-card",
    });

    return Response.json({ success: true, id: newId });
  } catch (error) {
    console.error("Add subscription error:", error);
    return Response.json({ error: "Failed to add subscription" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const subId = searchParams.get("id");

    if (!subId) {
      return Response.json({ error: "Subscription ID is required" }, { status: 400 });
    }

    await db
      .delete(subscriptions)
      .where(and(eq(subscriptions.id, subId), eq(subscriptions.userId, user.id)));

    return Response.json({ success: true });
  } catch (error) {
    console.error("Delete subscription error:", error);
    return Response.json({ error: "Failed to delete subscription" }, { status: 500 });
  }
}
