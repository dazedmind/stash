import { db } from "@/db";
import { categories } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getAuthenticatedUser } from "@/app/lib/auth";

export async function PUT(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { percentages } = body as { percentages: Record<string, number> };

    if (!percentages || typeof percentages !== "object") {
      return Response.json({ error: "Invalid allocations data" }, { status: 400 });
    }

    for (const [catId, pct] of Object.entries(percentages)) {
      const percentage = Math.min(100, Math.max(0, Number.parseInt(String(pct), 10) || 0));
      await db
        .update(categories)
        .set({ percentage })
        .where(and(eq(categories.id, catId), eq(categories.userId, user.id)));
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Update allocations error:", error);
    return Response.json({ error: "Failed to update allocations" }, { status: 500 });
  }
}
