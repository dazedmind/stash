import { db } from "@/db";
import { payLaterInstallments, payLaters } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { generateId, getAuthenticatedUser } from "@/app/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return Response.json({ payLaters: [] });
    }

    const items = await db
      .select()
      .from(payLaters)
      .where(eq(payLaters.userId, user.id));

    const installments = await db
      .select()
      .from(payLaterInstallments)
      .where(eq(payLaterInstallments.userId, user.id));

    const formatted = items.map((item) => {
      const itemInstallments = installments.filter((ins) => ins.payLaterId === item.id);
      return {
        ...item,
        installments: itemInstallments,
      };
    });

    return Response.json({ payLaters: formatted });
  } catch (error) {
    console.error("Fetch pay laters error:", error);
    return Response.json({ error: "Failed to fetch Pay Later items" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, totalAmount, interestRate, frequency, dueDate, paymentType, months } = body;
    const trimmedName = name?.trim();

    const parsedTotal = Number.parseInt(String(totalAmount), 10) || 0;
    const parsedRate = Number.parseInt(String(interestRate), 10) || 0;
    const parsedMonths = Math.max(1, Number.parseInt(String(months), 10) || 1);

    if (!trimmedName || parsedTotal <= 0) {
      return Response.json({ error: "Name and valid total amount are required" }, { status: 400 });
    }

    const totalWithInterest = Math.round(parsedTotal * (1 + parsedRate / 100));
    const isOneTime = paymentType === "one_time" || parsedMonths === 1;
    const numMonths = isOneTime ? 1 : parsedMonths;
    const monthlyPayment = Math.round(totalWithInterest / numMonths);

    const payLaterId = generateId();

    await db.insert(payLaters).values({
      id: payLaterId,
      userId: user.id,
      name: trimmedName,
      totalAmount: parsedTotal,
      interestRate: parsedRate,
      frequency: frequency || "Monthly",
      dueDate: dueDate || new Date().toISOString().split("T")[0],
      paymentType: isOneTime ? "one_time" : "installment",
      months: numMonths,
      monthlyPayment,
    });

    const baseDate = new Date(dueDate || Date.now());

    for (let i = 0; i < numMonths; i++) {
      const insDueDate = new Date(baseDate);

      if (frequency === "Weekly") {
        insDueDate.setDate(baseDate.getDate() + i * 7);
      } else if (frequency === "Bi-weekly") {
        insDueDate.setDate(baseDate.getDate() + i * 14);
      } else {
        insDueDate.setMonth(baseDate.getMonth() + i);
      }

      const formattedDueDate = insDueDate.toISOString().split("T")[0];
      const title = isOneTime ? "Full Payment" : `Payment ${i + 1} of ${numMonths}`;

      const currentAmount = i === numMonths - 1
        ? totalWithInterest - monthlyPayment * (numMonths - 1)
        : monthlyPayment;

      await db.insert(payLaterInstallments).values({
        id: generateId(),
        payLaterId,
        userId: user.id,
        title,
        amount: currentAmount,
        dueDate: formattedDueDate,
        isPaid: 0,
      });
    }

    return Response.json({ success: true, id: payLaterId });
  } catch (error) {
    console.error("Create Pay Later error:", error);
    return Response.json({ error: "Failed to create Pay Later item" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { installmentId, isPaid, payLaterId, name } = body;

    // Handle Pay Later item rename
    if (payLaterId && name && typeof name === "string") {
      const trimmedName = name.trim();
      if (!trimmedName) {
        return Response.json({ error: "Name cannot be empty" }, { status: 400 });
      }
      await db
        .update(payLaters)
        .set({ name: trimmedName })
        .where(and(eq(payLaters.id, payLaterId), eq(payLaters.userId, user.id)));

      return Response.json({ success: true });
    }

    // Handle Installment payment status toggle
    if (installmentId) {
      const paidVal = isPaid ? 1 : 0;
      await db
        .update(payLaterInstallments)
        .set({
          isPaid: paidVal,
          paidAt: paidVal ? new Date() : null,
        })
        .where(and(eq(payLaterInstallments.id, installmentId), eq(payLaterInstallments.userId, user.id)));

      return Response.json({ success: true });
    }

    return Response.json({ error: "Invalid payload" }, { status: 400 });
  } catch (error) {
    console.error("Update pay-later error:", error);
    return Response.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "Pay Later ID required" }, { status: 400 });
    }

    await db
      .delete(payLaterInstallments)
      .where(and(eq(payLaterInstallments.payLaterId, id), eq(payLaterInstallments.userId, user.id)));

    await db
      .delete(payLaters)
      .where(and(eq(payLaters.id, id), eq(payLaters.userId, user.id)));

    return Response.json({ success: true });
  } catch (error) {
    console.error("Delete Pay Later error:", error);
    return Response.json({ error: "Failed to delete Pay Later item" }, { status: 500 });
  }
}
