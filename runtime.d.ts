// Minimal runtime binding contracts used by this application.
interface D1Result<T=unknown> { results:T[]; success:boolean; meta:Record<string,unknown>; }
interface D1PreparedStatement {
 bind(...values:unknown[]):D1PreparedStatement;
 all<T=unknown>():Promise<D1Result<T>>;
 run<T=unknown>():Promise<D1Result<T>>;
 first<T=unknown>(column?:string):Promise<T|null>;
 raw<T=unknown[]>():Promise<T[]>;
}
interface D1Database {
 prepare(query:string):D1PreparedStatement;
 batch<T=unknown>(statements:D1PreparedStatement[]):Promise<D1Result<T>[]>;
 exec(query:string):Promise<{count:number;duration:number}>;
 dump():Promise<ArrayBuffer>;
}
interface Fetcher { fetch(request:Request):Promise<Response>; }
declare module "cloudflare:workers" {
 export const env:{DB:D1Database;OPENAI_API_KEY?:string;OPENAI_MODEL?:string};
}
