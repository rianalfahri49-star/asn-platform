import { NextResponse } from "next/server";
export async function GET(){return NextResponse.json({service:"SuksesCPNS",status:"ok",timestamp:new Date().toISOString()},{headers:{"Cache-Control":"no-store"}});}
