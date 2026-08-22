import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthenticatedUser, hashPassword, verifyPassword } from "@/app/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    return Response.json({ user });
  } catch (error) {
    console.error("Auth me error:", error);
    return Response.json({ user: null });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, currentPassword, newPassword } = body;

    // ── Password change ──────────────────────────────────────────
    if (currentPassword && newPassword) {
      const [fullUser] = await db.select().from(users).where(eq(users.id, user.id));
      if (!fullUser) return Response.json({ error: "User not found" }, { status: 404 });

      const isValid = await verifyPassword(currentPassword, fullUser.passwordHash);
      if (!isValid) return Response.json({ error: "Current password is incorrect" }, { status: 400 });

      const newHash = await hashPassword(newPassword);
      await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, user.id));
      return Response.json({ success: true });
    }

    // ── Profile update ────────────────────────────────────────────
    const updatePayload: Record<string, string> = {};
    if (name && typeof name === "string" && name.trim()) {
      updatePayload.name = name.trim();
    }
    if (email && typeof email === "string" && email.trim()) {
      updatePayload.email = email.trim().toLowerCase();
    }

    if (Object.keys(updatePayload).length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    await db.update(users).set(updatePayload).where(eq(users.id, user.id));
    return Response.json({ success: true });
  } catch (error) {
    console.error("Update user error:", error);
    return Response.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete all sessions first, then user (cascade deletes all user data)
    await db.delete(sessions).where(eq(sessions.userId, user.id));
    await db.delete(users).where(eq(users.id, user.id));

    return Response.json({ success: true });
  } catch (error) {
    console.error("Delete account error:", error);
    return Response.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
