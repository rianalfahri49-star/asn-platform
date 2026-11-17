"use client";
import Link from "next/link";
import {FormEvent,useMemo,useState} from "react";
import {createBrowserClient} from "@supabase/ssr";
import {ArrowLeft,Mail} from "lucide-react";
export default function LupaPasswordPage(){
 const db=useMemo(()=>{const u=process.env.NEXT_PUBLIC_SUPABASE_URL,k=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;return u&&k?createBrowserClient(u,k):null;},[]);
 const [email,setEmail]=useState("");const [message,setMessage]=useState("");const [busy,setBusy]=useState(false);
 async function submit(e:FormEvent){e.preventDefault();if(!db){setMessage("Layanan akun belum dikonfigurasi.");return;}setBusy(true);const {error}=await db.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+"/reset-password"});setBusy(false);setMessage(error?error.message:"Jika email terdaftar, tautan pemulihan akan dikirim ke kotak masuk.");}
 return <main className="grid min-h-screen place-items-center bg-slate-50 p-5"><section className="w-full max-w-md rounded-3xl border bg-white p-8 shadow-xl"><Link href="/masuk" className="inline-flex items-center gap-2 text-sm font-bold text-blue-700"><ArrowLeft size={16}/> Kembali ke masuk</Link><Mail className="mt-8 text-blue-600" size={30}/><h1 className="mt-4 text-2xl font-black">Lupa password?</h1><p className="mt-2 text-sm leading-6 text-slate-500">Masukkan email akunmu untuk menerima tautan pengaturan ulang password.</p><form onSubmit={submit} className="mt-6 space-y-4"><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="nama@email.com" className="w-full rounded-xl border p-3"/><button disabled={busy} className="w-full rounded-xl bg-blue-600 p-3 font-bold text-white disabled:opacity-50">{busy?"Mengirim...":"Kirim tautan pemulihan"}</button></form>{message&&<p role="status" className="mt-4 rounded-xl bg-blue-50 p-3 text-sm text-blue-800">{message}</p>}</section></main>;
}
