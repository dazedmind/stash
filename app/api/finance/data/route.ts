import { db } from "@/db";
import { categories as categoriesTable, subcategories as subcategoriesTable, subscriptions as subscriptionsTable } from "@/db/schema";
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

    // Sort categories by displayOrder ascending
    userCategories.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

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
      isSafe: Boolean(cat.isSafe),
      isHidden: Boolean(cat.isHidden),
      showInHomescreen: Boolean(cat.showInHomescreen),
      overflowSubId: cat.overflowSubId || undefined,
      displayOrder: cat.displayOrder ?? 0,
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
          isSafe: Boolean(sub.isSafe),
          maxCap: sub.maxCap || 0,
          overflowSubId: sub.overflowSubId || undefined,
          icon: sub.icon || "wallet",
        })),
    }));

    const userSubscriptions = await db
      .select()
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.userId, user.id));

    return Response.json({
      user,
      categories: formattedCategories,
      subscriptions: userSubscriptions.map(s => ({
        ...s,
        billingDate: s.billingDate.toISOString()
      })),
    });
  } catch (error) {
    console.error("Fetch finance data error:", error);
    return Response.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
