import { getAuthenticatedUser } from "@/app/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    return Response.json({ user });
  } catch (error) {
    console.error("Auth me error:", error);
    return Response.json({ user: null });
  }
}
