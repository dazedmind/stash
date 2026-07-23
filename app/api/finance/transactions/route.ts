import { db } from "@/db";
import { subcategories, transactions } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getAuthenticatedUser } from "@/app/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const logs = await db
      .select({
        id: transactions.id,
        type: transactions.type,
        amount: transactions.amount,
        source: transactions.source,
        description: transactions.description,
        details: transactions.details,
        createdAt: transactions.createdAt,
        subCategoryName: subcategories.name,
      })
      .from(transactions)
      .leftJoin(subcategories, eq(transactions.subCategoryId, subcategories.id))
      .where(eq(transactions.userId, user.id))
      .orderBy(desc(transactions.createdAt))
      .limit(50);

    const formattedLogs = logs.map((log) => {
      let parsedDetails: Record<string, number> | null = null;
      if (log.details) {
        try {
          parsedDetails = JSON.parse(log.details);
        } catch {
          parsedDetails = null;
        }
      }

      return {
        id: log.id,
        type: log.type as "income" | "expense" | "transfer_internal" | "transfer_sub",
        amount: log.amount,
        source: log.source,
        description: log.description,
        subCategoryName: log.subCategoryName || null,
        breakdown: parsedDetails,
        createdAt: log.createdAt,
      };
    });

    return Response.json({ transactions: formattedLogs });
  } catch (error) {
    console.error("Fetch transactions error:", error);
    return Response.json({ error: "Failed to fetch transaction logs" }, { status: 500 });
  }
}
