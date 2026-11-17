import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const PACKAGES={premium_monthly:{amount:49000,name:"SuksesCPNS Premium Bulanan"},premium_yearly:{amount:399000,name:"SuksesCPNS Premium Tahunan"}} as const;
type PackageId=keyof typeof PACKAGES;
export async function POST(request:Request){
 const cookieStore=await cookies();
 const supabase=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL||"",process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||"",{cookies:{getAll(){return cookieStore.getAll();},setAll(values){values.forEach(({name,value,options})=>cookieStore.set(name,value,options));}}});
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"Silakan masuk terlebih dahulu."},{status:401});
 const body=await request.json().catch(()=>null) as {packageId?:string}|null;
 if(!body?.packageId||!(body.packageId in PACKAGES))return NextResponse.json({error:"Paket tidak valid."},{status:400});
 const packageId=body.packageId as PackageId;const selected=PACKAGES[packageId];const serverKey=process.env.MIDTRANS_SERVER_KEY;
 if(!serverKey)return NextResponse.json({error:"Pembayaran belum diaktifkan. Admin perlu mengatur MIDTRANS_SERVER_KEY."},{status:503});
 const orderId="SCPNS-"+Date.now()+"-"+crypto.randomUUID().slice(0,8);
 const {data:order,error:insertError}=await supabase.from("payment_orders").insert({user_id:user.id,order_id:orderId,package_id:packageId,amount:selected.amount,status:"pending"}).select("id").single();
 if(insertError||!order)return NextResponse.json({error:"Tidak dapat membuat pesanan."},{status:500});
 const origin=process.env.NEXT_PUBLIC_APP_URL||new URL(request.url).origin;
 const response=await fetch("https://app.midtrans.com/snap/v1/transactions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Basic "+Buffer.from(serverKey+":").toString("base64")},body:JSON.stringify({transaction_details:{order_id:orderId,gross_amount:selected.amount},item_details:[{id:packageId,price:selected.amount,quantity:1,name:selected.name}],customer_details:{email:user.email},callbacks:{finish:origin+"/akun"}})});
 const payload=await response.json().catch(()=>({}));
 if(!response.ok||!payload.redirect_url){await supabase.from("payment_orders").update({status:"failed",provider_payload:payload}).eq("id",order.id);return NextResponse.json({error:"Penyedia pembayaran gagal membuat transaksi."},{status:502});}
 await supabase.from("payment_orders").update({payment_url:payload.redirect_url,provider_payload:{token:payload.token}}).eq("id",order.id);
 return NextResponse.json({orderId,redirectUrl:payload.redirect_url});
}
