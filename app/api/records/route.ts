import { recordSchema } from "@/lib/model";
import { authenticatedClient, jsonError, validOrigin } from "@/lib/server-auth";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { db, user } = await authenticatedClient(req);
    const { data, error } = await db.from("records").select("data").eq("user_id", user.id);
    if (error) throw error;
    return Response.json({ records: (data ?? []).map(row => row.data) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return jsonError(error); }
}

export async function POST(req: Request) {
  try {
    if (!validOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
    const { db, user } = await authenticatedClient(req);
    const raw = await req.text();
    if (raw.length > 500000) return Response.json({ error: "Import is too large. Maximum 500 KB." }, { status: 413 });
    const body = JSON.parse(raw);
    if (!Array.isArray(body.records) || body.records.length > 500) return Response.json({ error: "Import up to 500 records at once." }, { status: 400 });
    const parsed = recordSchema.array().safeParse(body.records);
    if (!parsed.success) return Response.json({ error: parsed.error.issues.map(issue => issue.path.join(".") + ": " + issue.message).slice(0, 5).join("; ") }, { status: 400 });
    if (parsed.data.length) {
      const { error } = await db.from("records").upsert(parsed.data.map(row => ({ user_id: user.id, id: row.id, kind: row.kind, data: row })), { onConflict: "user_id,id" });
      if (error) throw error;
    }
    return Response.json({ saved: parsed.data.length });
  } catch (error) { return jsonError(error); }
}

export async function DELETE(req: Request) {
  try {
    if (!validOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
    const { db, user } = await authenticatedClient(req);
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return Response.json({ error: "Missing record" }, { status: 400 });
    const { error } = await db.from("records").delete().eq("user_id", user.id).eq("id", id);
    if (error) throw error;
    return Response.json({ deleted: true });
  } catch (error) { return jsonError(error); }
}
