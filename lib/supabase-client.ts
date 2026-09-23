import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);

export async function apiFetch(path: string, init?: RequestInit) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Please sign in again.");
  return fetch(path, { ...init, headers: { ...init?.headers, Authorization: `Bearer ${session.access_token}` } });
}
