"use client";
import { useEffect, useState } from "react";
import Dashboard from "./dashboard";
import { isSupabaseConfigured, supabase } from "@/lib/supabase-client";

export default function Home() {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }
    void supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user.email ?? null); setLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user.email ?? null));
    return () => subscription.unsubscribe();
  }, []);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    const result = mode === "signin" ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (result.error) setMessage(result.error.message);
    else if (mode === "signup" && !result.data.session) setMessage("Account created. Confirm your email, then sign in.");
  }
  if (loading) return <main className="auth-shell"><p>Opening ServeSync…</p></main>;
  if (!isSupabaseConfigured) return <main className="auth-shell"><section className="auth-card"><strong className="auth-logo">ServeSync</strong><h1>Database setup required</h1><p>Add the Supabase project URL and publishable key to the deployment environment, then redeploy.</p></section></main>;
  if (user) return <><div className="auth-bar">Signed in as {user} <button onClick={() => void supabase.auth.signOut()}>Sign out</button></div><Dashboard key={user}/></>;
  return <main className="auth-shell"><form className="auth-card" onSubmit={submit}>
    <strong className="auth-logo">ServeSync</strong><h1>{mode === "signin" ? "Sign in to your restaurant" : "Create your restaurant account"}</h1>
    <p>Manage orders, costs and insights in one workspace.</p>
    <label>Email<input type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} /></label>
    <label>Password<input type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} minLength={6} required value={password} onChange={event => setPassword(event.target.value)} /></label>
    {message && <p role="status" className="auth-error">{message}</p>}
    <button className="auth-submit" disabled={busy}>{busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</button>
    <button type="button" className="auth-toggle" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setMessage(""); }}>{mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}</button>
  </form></main>;
}
