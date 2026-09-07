import { z } from "zod";
const money=z.number().finite().min(0).max(100000000).refine(n=>Math.abs(n*100-Math.round(n*100))<0.00001,"Use at most 2 decimal places");
const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(x=>!isNaN(Date.parse(x))&&new Date(x).toISOString().slice(0,10)===x,"Invalid date");
export const recordSchema=z.union([
 z.object({id:z.string().min(1).max(100),kind:z.literal("menu"),name:z.string().trim().min(1).max(120),category:z.string().min(1).max(80),price:money,cost:money,active:z.boolean()}),
 z.object({id:z.string().min(1).max(100),kind:z.literal("expense"),name:z.string().trim().min(1).max(120),category:z.string().min(1).max(80),date,amount:money}),
 z.object({id:z.string().min(1).max(100),kind:z.literal("order"),reference:z.string().min(1).max(80),partner:z.string().min(1).max(80),date,name:z.string().min(1).max(200),gross:money,discount:money,refund:money,fee:money,food:money,packaging:money,status:z.enum(["Delivered","Preparing","Ready","Cancelled"])}).refine(o=>o.discount+o.refund<=o.gross,"Discount + refund cannot exceed gross")
]);
export type RecordData=z.infer<typeof recordSchema>;
export const rupees=(v:number)=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(v);
export function calculate(rows:RecordData[],start:string,end:string){
 const selected=rows.filter(r=>r.kind!=="menu"&&r.date>=start&&r.date<=end);
 const orders=selected.filter(r=>r.kind==="order");
 const total=(key:string)=>orders.reduce((s,o)=>s+Math.round((Number((o as any)[key])||0)*100),0)/100;
 const gross=total("gross"),discount=total("discount"),refund=total("refund"),fees=total("fee"),food=total("food"),packaging=total("packaging");
 const overhead=selected.filter(r=>r.kind==="expense").reduce((s,r)=>s+Math.round(r.amount*100),0)/100;
 const revenue=+(gross-discount-refund).toFixed(2),cost=+(fees+food+packaging+overhead).toFixed(2),profit=+(revenue-cost).toFixed(2);
 const days=Math.max(1,Math.round((Date.parse(end)-Date.parse(start))/86400000)+1);
 return {gross,discount,refund,fees,food,packaging,overhead,revenue,cost,profit,orders:orders.length,margin:revenue?profit/revenue*100:0,days,forecast:profit/days*30};
}
