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
    const { categoryId, name, icon } = body;
    const trimmedName = name?.trim();

    if (!categoryId || !trimmedName) {
      return Response.json({ error: "Category ID and name are required" }, { status: 400 });
    }

    const catExists = await db
      .select()
      .from(categories)
      .where(and(eq(categories.id, categoryId), eq(categories.userId, user.id)));

    if (!catExists.length) {
      return Response.json({ error: "Category not found" }, { status: 404 });
    }

    const newSubId = generateId();
    await db.insert(subcategories).values({
      id: newSubId,
      categoryId,
      userId: user.id,
      name: trimmedName,
      digital: 0,
      cash: 0,
      allocated: 0,
      isHidden: 0,
      icon: icon || "wallet",
    });

    return Response.json({ success: true, id: newSubId });
  } catch (error) {
    console.error("Add subcategory error:", error);
    return Response.json({ error: "Failed to add subcategory" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { subCategoryId, name, isHidden, icon } = body;

    if (!subCategoryId) {
      return Response.json({ error: "Subcategory ID required" }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {};
    if (name && typeof name === "string") {
      updatePayload.name = name.trim();
    }
    if (typeof isHidden === "boolean") {
      updatePayload.isHidden = isHidden ? 1 : 0;
    }
    if (icon && typeof icon === "string") {
      updatePayload.icon = icon;
    }

    if (Object.keys(updatePayload).length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    await db
      .update(subcategories)
      .set(updatePayload)
      .where(and(eq(subcategories.id, subCategoryId), eq(subcategories.userId, user.id)));

    return Response.json({ success: true });
  } catch (error) {
    console.error("Update subcategory error:", error);
    return Response.json({ error: "Failed to update subcategory" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const subCategoryId = searchParams.get("id");

    if (!subCategoryId) {
      return Response.json({ error: "Subcategory ID is required" }, { status: 400 });
    }

    await db
      .delete(subcategories)
      .where(and(eq(subcategories.id, subCategoryId), eq(subcategories.userId, user.id)));

    return Response.json({ success: true });
  } catch (error) {
    console.error("Delete subcategory error:", error);
    return Response.json({ error: "Failed to delete subcategory" }, { status: 500 });
  }
}
