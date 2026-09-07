import {recordSchema,RecordData} from "./model";
export const csvTemplate="reference,partner,date,name,gross,discount,refund,fee,food,packaging,status\n";
export function parseCSV(text:string):Record<string,string>[]{
 const rows:string[][]=[];let row:string[]=[],cell="",quoted=false;
 const clean=text.replace(/^\uFEFF/,"");
 for(let i=0;i<clean.length;i++){const c=clean[i];if(c==='"'){if(quoted&&clean[i+1]==='"'){cell+='"';i++}else quoted=!quoted}else if(c===","&&!quoted){row.push(cell);cell=""}else if((c==="\n"||c==="\r")&&!quoted){if(c==="\r"&&clean[i+1]==="\n")i++;row.push(cell);if(row.some(v=>v.trim()))rows.push(row);row=[];cell=""}else cell+=c}
 if(quoted)throw new Error("CSV has an unclosed quoted field.");row.push(cell);if(row.some(v=>v.trim()))rows.push(row);
 const headers=rows.shift()?.map(s=>s.trim().toLowerCase())??[];
 const required=csvTemplate.trim().split(",");if(required.some(h=>!headers.includes(h)))throw new Error("Use the ServeSync template with all required columns.");
 return rows.map((r,i)=>{if(r.length!==headers.length)throw new Error("Column count mismatch on row "+(i+2));return Object.fromEntries(headers.map((h,j)=>[h,r[j].trim()]))});
}
export function orderFromCSV(r:Record<string,string>,i:number):RecordData {
 const nums=["gross","discount","refund","fee","food","packaging"];
 if(nums.some(k=>r[k]===""||!Number.isFinite(Number(r[k]))))throw new Error("Row "+(i+2)+": enter every amount (use 0 where applicable).");
 const id="import:"+encodeURIComponent(r.partner)+":"+encodeURIComponent(r.reference);
 const item={...r,id,kind:"order",...Object.fromEntries(nums.map(k=>[k,Number(r[k])]))};
 const p=recordSchema.safeParse(item);if(!p.success)throw new Error("Invalid row "+(i+2)+": check date, status, reference, and amounts.");return p.data;
}
