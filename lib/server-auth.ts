import { createClient } from "@supabase/supabase-js";

export const validOrigin = (req: Request) => req.headers.get("origin") === new URL(req.url).origin;

export async function authenticatedClient(req: Request) {
  const token = req.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
  if (!token) throw new Error("Unauthenticated");
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: { user }, error } = await db.auth.getUser(token);
  if (error || !user || user.is_anonymous) throw new Error("Unauthenticated");
  return { db, user };
}

export function jsonError(error: unknown) {
  const unauthorized = error instanceof Error && error.message === "Unauthenticated";
  if (!unauthorized) console.error("ServeSync API error", error instanceof Error ? error.message : "unknown");
  return Response.json({ error: unauthorized ? "Sign in to continue." : "Unable to complete request. Please retry." }, { status: unauthorized ? 401 : 500 });
}
