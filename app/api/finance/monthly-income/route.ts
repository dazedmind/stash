import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthenticatedUser } from "@/app/lib/auth";

export async function PUT(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const amount = Number.parseInt(body.amount, 10);

    if (!Number.isFinite(amount) || amount < 0) {
      return Response.json({ error: "Invalid amount" }, { status: 400 });
    }

    await db
      .update(users)
      .set({ monthlyIncome: amount })
      .where(eq(users.id, user.id));

    return Response.json({ success: true });
  } catch (error) {
    console.error("Monthly income API error:", error);
    return Response.json({ error: "Failed to update monthly income" }, { status: 500 });
  }
}
