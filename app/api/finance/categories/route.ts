import { db } from "@/db";
import { categories, subcategories } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { generateId, getAuthenticatedUser } from "@/app/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, tag, percentage, icon, isSafe, overflowSubId } = body;
    const trimmedName = name?.trim();

    if (!trimmedName) {
      return Response.json({ error: "Category name is required" }, { status: 400 });
    }

    const newCatId = generateId();
    await db.insert(categories).values({
      id: newCatId,
      userId: user.id,
      name: trimmedName,
      tag: tag || trimmedName,
      percentage: Number.parseInt(String(percentage), 10) || 0,
      icon: icon || "wallet",
      isSafe: isSafe ? 1 : 0,
      overflowSubId: overflowSubId || null,
    });

    return Response.json({ success: true, id: newCatId });
  } catch (error) {
    console.error("Add category error:", error);
    return Response.json({ error: "Failed to add category" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { categoryId, name, tag, icon, isSafe, isHidden, showInHomescreen, overflowSubId } = body;

    if (!categoryId) {
      return Response.json({ error: "Category ID is required" }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {};
    if (name && typeof name === "string") updatePayload.name = name.trim();
    if (tag && typeof tag === "string") updatePayload.tag = tag;
    if (icon && typeof icon === "string") updatePayload.icon = icon;
    if (typeof isSafe === "boolean") updatePayload.isSafe = isSafe ? 1 : 0;
    if (typeof isHidden === "boolean") updatePayload.isHidden = isHidden ? 1 : 0;
    if (typeof showInHomescreen === "boolean") updatePayload.showInHomescreen = showInHomescreen ? 1 : 0;
    if (overflowSubId !== undefined) updatePayload.overflowSubId = overflowSubId || null;

    if (Object.keys(updatePayload).length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    await db
      .update(categories)
      .set(updatePayload)
      .where(and(eq(categories.id, categoryId), eq(categories.userId, user.id)));

    return Response.json({ success: true });
  } catch (error) {
    console.error("Update category error:", error);
    return Response.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("id");

    if (!categoryId) {
      return Response.json({ error: "Category ID is required" }, { status: 400 });
    }

    await db
      .delete(subcategories)
      .where(and(eq(subcategories.categoryId, categoryId), eq(subcategories.userId, user.id)));

    await db
      .delete(categories)
      .where(and(eq(categories.id, categoryId), eq(categories.userId, user.id)));

    return Response.json({ success: true });
  } catch (error) {
    console.error("Delete category error:", error);
    return Response.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
