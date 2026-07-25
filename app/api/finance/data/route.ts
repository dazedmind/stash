import { db } from "@/db";
import { categories as categoriesTable, subcategories as subcategoriesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthenticatedUser } from "@/app/lib/auth";
import { seedUserDefaultCategories } from "@/app/lib/seedUserCategories";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    let userCategories = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.userId, user.id));

    if (userCategories.length === 0) {
      await seedUserDefaultCategories(user.id);
      userCategories = await db
        .select()
        .from(categoriesTable)
        .where(eq(categoriesTable.userId, user.id));
    }

    const userSubcategories = await db
      .select()
      .from(subcategoriesTable)
      .where(eq(subcategoriesTable.userId, user.id));

    const formattedCategories = userCategories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      tag: cat.tag,
      percentage: cat.percentage,
      icon: cat.icon || "wallet",
      subcategories: userSubcategories
        .filter((sub) => sub.categoryId === cat.id)
        .map((sub) => ({
          id: sub.id,
          categoryId: sub.categoryId,
          name: sub.name,
          digital: sub.digital,
          cash: sub.cash,
          allocated: sub.allocated,
          isHidden: Boolean(sub.isHidden),
          icon: sub.icon || "wallet",
        })),
    }));

    return Response.json({
      user,
      categories: formattedCategories,
    });
  } catch (error) {
    console.error("Fetch finance data error:", error);
    return Response.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
