import {supabase} from "./supabase";
function param(url:URL,key:string){return url.searchParams.get(key)||new URLSearchParams(url.hash.replace(/^#/,"")).get(key);}
export async function handleSupabaseAuthUrl(raw:string){
 try{
  const url=new URL(raw),code=param(url,"code");
  if(code){const {error}=await supabase.auth.exchangeCodeForSession(code);return {handled:true,error:error?.message};}
  const access_token=param(url,"access_token"),refresh_token=param(url,"refresh_token");
  if(access_token&&refresh_token){const {error}=await supabase.auth.setSession({access_token,refresh_token});return {handled:true,error:error?.message};}
  const token_hash=param(url,"token_hash"),type=param(url,"type");
  if(token_hash&&(type==="signup"||type==="recovery"||type==="email")){const {error}=await supabase.auth.verifyOtp({token_hash,type});return {handled:true,error:error?.message};}
  return {handled:false};
 }catch(e){return {handled:false,error:e instanceof Error?e.message:"Tautan autentikasi tidak valid."};}
}
