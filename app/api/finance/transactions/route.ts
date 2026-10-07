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

    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");
    const limitVal = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 50, 1), 1000) : 50;

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
      .limit(limitVal);

    const formattedLogs = logs.map((log) => {
      let parsedDetails: any = null;
      let tag: string | null = null;
      if (log.details) {
        try {
          parsedDetails = JSON.parse(log.details);
          if (parsedDetails && typeof parsedDetails === "object") {
            if ("tag" in parsedDetails && typeof parsedDetails.tag === "string") {
              tag = parsedDetails.tag;
            }
          }
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
        breakdown: parsedDetails && !tag ? parsedDetails : null,
        tag,
        createdAt: log.createdAt,
      };
    });

    return Response.json({ transactions: formattedLogs });
  } catch (error) {
    console.error("Fetch transactions error:", error);
    return Response.json({ error: "Failed to fetch transaction logs" }, { status: 500 });
  }
}
