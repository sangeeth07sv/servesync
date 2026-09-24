import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
export const supabase = createClient(
  supabaseUrl ?? "https://configuration-required.supabase.co",
  supabaseKey ?? "sb_publishable_configuration_required",
);

export async function apiFetch(path: string, init?: RequestInit) {
  if (!isSupabaseConfigured) throw new Error("ServeSync database is not configured.");
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Please sign in again.");
  return fetch(path, { ...init, headers: { ...init?.headers, Authorization: `Bearer ${session.access_token}` } });
}
