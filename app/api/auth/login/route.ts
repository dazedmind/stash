import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { buildSessionCookie, createSession, verifyPassword } from "@/app/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json({ error: "Email and password are required" }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()));

    if (!existing.length) {
      return Response.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const user = existing[0];
    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return Response.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const { sessionId, expiresAt } = await createSession(user.id);
    const cookieHeader = buildSessionCookie(sessionId, expiresAt);

    return Response.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          monthlyIncome: user.monthlyIncome,
          totalIncomeReceived: user.totalIncomeReceived,
        },
      },
      {
        headers: {
          "Set-Cookie": cookieHeader,
        },
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ error: "Login failed" }, { status: 500 });
  }
}
