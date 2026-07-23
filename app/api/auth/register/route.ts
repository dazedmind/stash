import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  buildSessionCookie,
  createSession,
  generateId,
  hashPassword,
} from "@/app/lib/auth";
import { seedUserDefaultCategories } from "@/app/lib/seedUserCategories";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return Response.json({ error: "Invalid email address" }, { status: 400 });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return Response.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()));

    if (existing.length > 0) {
      return Response.json({ error: "User already exists with this email" }, { status: 400 });
    }

    const userId = generateId();
    const passwordHash = await hashPassword(password);

    await db.insert(users).values({
      id: userId,
      email: email.toLowerCase().trim(),
      name: name?.trim() || "Stash User",
      passwordHash,
      monthlyIncome: 0,
      totalIncomeReceived: 0,
    });

    await seedUserDefaultCategories(userId);

    const { sessionId, expiresAt } = await createSession(userId);
    const cookieHeader = buildSessionCookie(sessionId, expiresAt);

    return Response.json(
      {
        user: {
          id: userId,
          email: email.toLowerCase().trim(),
          name: name?.trim() || "Stash User",
          monthlyIncome: 0,
          totalIncomeReceived: 0,
        },
      },
      {
        headers: {
          "Set-Cookie": cookieHeader,
        },
      }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return Response.json({ error: "Registration failed" }, { status: 500 });
  }
}
