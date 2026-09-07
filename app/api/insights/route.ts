import {env} from "cloudflare:workers";
import {database} from "@/lib/records";
import {calculate,RecordData} from "@/lib/model";
export async function POST(req:Request){
 if(!req.headers.get("oai-authenticated-user-id"))return Response.json({error:"Sign in to continue."},{status:401});
 if(req.headers.get("origin")!==new URL(req.url).origin)return Response.json({error:"Invalid origin"},{status:403});
 const config=env as unknown as {OPENAI_API_KEY?:string;OPENAI_MODEL?:string};
 if(!config.OPENAI_API_KEY||!config.OPENAI_MODEL)return Response.json({error:"Generative AI is not connected yet. Configure OPENAI_API_KEY and OPENAI_MODEL securely in the site environment. Calculated insights and forecasts remain available."},{status:503});
 try{const {start,end}=await req.json();if(typeof start!=="string"||typeof end!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(start)||!/^\d{4}-\d{2}-\d{2}$/.test(end)||start>end)return Response.json({error:"Choose a valid date range."},{status:400});
 const result=await database().prepare("SELECT data FROM records WHERE owner=?").bind(req.headers.get("oai-authenticated-user-id")).all<{data:string}>();const rows=result.results.map(r=>JSON.parse(r.data)) as RecordData[];
 const summary=calculate(rows,start,end);
 const response=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Authorization":"Bearer "+config.OPENAI_API_KEY,"Content-Type":"application/json"},signal:AbortSignal.timeout(30000),body:JSON.stringify({model:config.OPENAI_MODEL,messages:[{role:"system",content:"Analyze restaurant operational figures in INR. Provide three short practical observations. Do not invent demand patterns, ratings, savings, confidence scores or missing data. All forecasts are uncertain. State that costs may be incomplete. Do not give tax or legal advice."},{role:"user",content:JSON.stringify({start,end,summary})}]})});
 if(!response.ok)return Response.json({error:"AI provider could not complete the request. Check provider configuration or try later."},{status:502});
 const data=await response.json() as {choices?:{message?:{content?:string}}[]};const text=data.choices?.[0]?.message?.content;if(!text)throw new Error("Empty result");return Response.json({text});
 }catch{return Response.json({error:"AI analysis is temporarily unavailable. Please retry."},{status:503})}
}
