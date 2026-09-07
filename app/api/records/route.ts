import { database } from "@/lib/records";
import { recordSchema } from "@/lib/model";
function owner(req:Request){const id=req.headers.get("oai-authenticated-user-id");if(!id)throw new Error("Unauthenticated");return id}
function fail(e:unknown){console.error("records request failed",e instanceof Error?e.message:"unknown");return Response.json({error:e instanceof Error&&e.message==="Unauthenticated"?"Sign in to continue.":"Unable to save or load records. Please retry."},{status:e instanceof Error&&e.message==="Unauthenticated"?401:500})}
export async function GET(req:Request){try{const id=owner(req);const r=await database().prepare("SELECT data FROM records WHERE owner = ?").bind(id).all<{data:string}>();return Response.json({records:r.results.map(r=>JSON.parse(r.data))},{headers:{"Cache-Control":"no-store"}})}catch(e){return fail(e)}}
export async function POST(req:Request){try{const id=owner(req);if(req.headers.get("origin")!==new URL(req.url).origin)return Response.json({error:"Invalid origin"},{status:403});
const raw=await req.text();if(raw.length>500000)return Response.json({error:"Import is too large. Maximum 500 KB."},{status:413});
const body=JSON.parse(raw);if(!Array.isArray(body.records)||body.records.length>500)return Response.json({error:"Import up to 500 records at once."},{status:400});
const parsed=recordSchema.array().safeParse(body.records);if(!parsed.success)return Response.json({error:parsed.error.issues.map(i=>i.path.join(".")+": "+i.message).slice(0,5).join("; ")},{status:400});
const db=database();if(parsed.data.length)await db.batch(parsed.data.map(r=>db.prepare("INSERT INTO records (owner,id,kind,data) VALUES (?,?,?,?) ON CONFLICT(owner,id) DO UPDATE SET kind=excluded.kind,data=excluded.data").bind(id,r.id,r.kind,JSON.stringify(r))));
return Response.json({saved:parsed.data.length});}catch(e){return fail(e)}}
export async function DELETE(req:Request){try{const id=owner(req);if(req.headers.get("origin")!==new URL(req.url).origin)return Response.json({error:"Invalid origin"},{status:403});const key=new URL(req.url).searchParams.get("id");if(!key)return Response.json({error:"Missing record"},{status:400});await database().prepare("DELETE FROM records WHERE owner=? AND id=?").bind(id,key).run();return Response.json({deleted:true});}catch(e){return fail(e)}}
