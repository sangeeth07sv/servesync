type AuthEnv={ADMIN_USERNAME?:string;ADMIN_PASSWORD?:string};
export async function authenticate(request:Request,env:AuthEnv):Promise<Request|Response>{
 if(!env.ADMIN_PASSWORD||env.ADMIN_PASSWORD.length<20){
   return new Response("Administrator setup required: configure ADMIN_PASSWORD with at least 20 characters using wrangler secret put.",{status:503,headers:{"Cache-Control":"no-store"}});
 }
 const url=new URL(request.url);
 if(url.protocol!=="https:"&&!["localhost","127.0.0.1","[::1]"].includes(url.hostname))
   return Response.redirect("https://"+url.host+url.pathname+url.search,308);
 const challenge=()=>new Response("Sign in using your restaurant administrator credentials.",{status:401,headers:{"WWW-Authenticate":'Basic realm="ServeSync", charset="UTF-8"',"Cache-Control":"no-store"}});
 const value=request.headers.get("Authorization")??"";
 if(!value.startsWith("Basic "))return challenge();
 let user="",password="";
 try{const bytes=Uint8Array.from(atob(value.slice(6)),c=>c.charCodeAt(0));const decoded=new TextDecoder().decode(bytes);const colon=decoded.indexOf(":");if(colon<0)return challenge();user=decoded.slice(0,colon);password=decoded.slice(colon+1);}catch{return challenge()}
 const enc=new TextEncoder();
 const [actual,expected]=await Promise.all([
   crypto.subtle.digest("SHA-256",enc.encode(user+"\u0000"+password)),
   crypto.subtle.digest("SHA-256",enc.encode((env.ADMIN_USERNAME||"admin")+"\u0000"+env.ADMIN_PASSWORD))
 ]);
 const a=new Uint8Array(actual),b=new Uint8Array(expected);let different=0;for(let i=0;i<a.length;i++)different|=a[i]^b[i];
 if(different)return challenge();
 const headers=new Headers(request.headers);
 // Never trust identity headers provided by an external browser.
 headers.delete("oai-authenticated-user-email");
 headers.delete("oai-authenticated-user-full-name");
 headers.set("oai-authenticated-user-id","restaurant-owner");
 headers.delete("Authorization");
 return new Request(request,{headers});
}
