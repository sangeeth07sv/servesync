import { authenticatedClient, jsonError, validOrigin } from "@/lib/server-auth";
import { calculate, type RecordData } from "@/lib/model";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    if (!validOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
    const { db, user } = await authenticatedClient(req);
    const { start, end } = await req.json();
    if (typeof start !== "string" || typeof end !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end) || start > end)
      return Response.json({ error: "Choose a valid date range." }, { status: 400 });
    const { data, error } = await db.from("records").select("data").eq("user_id", user.id);
    if (error) throw error;
    const summary = calculate((data ?? []).map(row => row.data) as RecordData[], start, end);
    if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_MODEL)
      return Response.json({ error: "Generative AI is optional and has not been configured. The free anomaly insights still work." }, { status: 503 });
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST", signal: AbortSignal.timeout(30000),
      headers: { Authorization: "Bearer " + process.env.OPENAI_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL, messages: [
        { role: "system", content: "Analyze restaurant figures in INR. Provide three short practical observations. Do not invent patterns or missing data. Forecasts are uncertain and costs may be incomplete. No tax or legal advice." },
        { role: "user", content: JSON.stringify({ start, end, summary }) }
      ] })
    });
    if (!response.ok) return Response.json({ error: "AI provider could not complete the request." }, { status: 502 });
    const result = await response.json() as { choices?: { message?: { content?: string } }[] };
    return Response.json({ text: result.choices?.[0]?.message?.content ?? "No analysis returned." });
  } catch (error) { return jsonError(error); }
}
