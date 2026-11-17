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
 const {error}=await supabase.rpc("apply_payment_notification",{p_order_id:body.order_id,p_status:mapped,p_payload:body});
 if(error)return NextResponse.json({error:"Gagal memproses notifikasi pembayaran."},{status:500});
 return NextResponse.json({received:true});
}
