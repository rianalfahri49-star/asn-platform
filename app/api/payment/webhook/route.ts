import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash, timingSafeEqual } from "crypto";

export async function POST(request:Request){
 const serverKey=process.env.MIDTRANS_SERVER_KEY;
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const serviceKey=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!serverKey||!url||!serviceKey)return NextResponse.json({error:"Webhook belum dikonfigurasi."},{status:503});
 const body=await request.json().catch(()=>null) as Record<string,string>|null;
 if(!body)return NextResponse.json({error:"Payload tidak valid."},{status:400});
 const expected=createHash("sha512").update((body.order_id||"")+(body.status_code||"")+(body.gross_amount||"")+serverKey).digest("hex");
 const received=body.signature_key||"";if(received.length!==expected.length||!timingSafeEqual(Buffer.from(received),Buffer.from(expected)))return NextResponse.json({error:"Signature tidak valid."},{status:401});
 const supabase=createClient(url,serviceKey);
 const status=body.transaction_status;
 const mapped=status==="settlement"||(status==="capture"&&body.fraud_status==="accept")?"paid":status==="expire"?"expired":status==="cancel"||status==="deny"?"failed":null;
 if(!mapped)return NextResponse.json({received:true});
 const {data:order,error}=await supabase.from("payment_orders").update({status:mapped,paid_at:mapped==="paid"?new Date().toISOString():null,provider_payload:body}).eq("order_id",body.order_id).eq("status","pending").select("user_id,package_id").maybeSingle();
 if(error)return NextResponse.json({error:"Gagal memperbarui status pesanan."},{status:500});
 if(order&&mapped==="paid"){
  const duration=order.package_id==="premium_yearly"?365:30;
  const ends=new Date(Date.now()+duration*86400000).toISOString();
  await supabase.from("user_subscriptions").insert({user_id:order.user_id,package_id:order.package_id,status:"active",ends_at:ends});
 }
 return NextResponse.json({received:true});
}
