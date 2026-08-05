import { db } from "@/db";
import { categories } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getAuthenticatedUser } from "@/app/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { categoryIds } = body;

    if (!Array.isArray(categoryIds)) {
      return Response.json({ error: "categoryIds array is required" }, { status: 400 });
    }

    // Update displayOrder for each category
    await Promise.all(
      categoryIds.map((id: string, index: number) =>
        db
          .update(categories)
          .set({ displayOrder: index })
          .where(and(eq(categories.id, id), eq(categories.userId, user.id)))
      )
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error("Reorder categories error:", error);
    return Response.json({ error: "Failed to reorder categories" }, { status: 500 });
  }
}
