import { buildClearSessionCookie, destroySession, parseCookies } from "@/app/lib/auth";

export async function POST(req: Request) {
  try {
    const cookies = parseCookies(req.headers.get("cookie"));
    const sessionId = cookies["stash_session"];

    if (sessionId) {
      await destroySession(sessionId);
    }

    return Response.json(
      { success: true },
      {
        headers: {
          "Set-Cookie": buildClearSessionCookie(),
        },
      }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return Response.json({ error: "Logout failed" }, { status: 500 });
  }
}
