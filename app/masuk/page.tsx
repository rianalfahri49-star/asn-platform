"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { GraduationCap, LoaderCircle } from "lucide-react";

export default function MasukPage() {
  const router = useRouter();
  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return url && key ? createBrowserClient(url, key) : null;
  }, []);
  const [mode,setMode]=useState<"login"|"signup">("login");
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  async function submit(e:FormEvent<HTMLFormElement>) {
    e.preventDefault(); setMessage("");
    if(!supabase){setMessage("Layanan akun belum dikonfigurasi. Admin perlu menambahkan kredensial Supabase.");return;}
    setBusy(true);
    if(mode==="login") {
      const {error}=await supabase.auth.signInWithPassword({email,password});
      setBusy(false);
      if(error){setMessage(error.message);return;}
      const requested=new URLSearchParams(window.location.search).get("next")||"/akun";
      const destination=requested.startsWith("/")&&!requested.startsWith("//")?requested:"/akun";
      router.push(destination); router.refresh();
    } else {
      const {data,error}=await supabase.auth.signUp({email,password,options:{data:{full_name:name}}});
      setBusy(false);
      if(error){setMessage(error.message);return;}
      if(data.session){
        const requested=new URLSearchParams(window.location.search).get("next")||"/akun";
        const destination=requested.startsWith("/")&&!requested.startsWith("//")?requested:"/akun";
        router.push(destination);router.refresh();
      } else setMessage("Pendaftaran berhasil. Periksa email untuk konfirmasi sebelum masuk.");
    }
  }
  return <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10">
    <section className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-7 shadow-xl sm:p-9">
      <Link href="/" className="inline-flex items-center gap-2 font-black text-slate-900"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white"><GraduationCap/></span>Sukses<span className="text-blue-600">CPNS</span></Link>
      <h1 className="mt-8 text-2xl font-black text-slate-950">{mode==="login"?"Selamat datang kembali":"Buat akun belajar"}</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">{mode==="login"?"Masuk untuk melanjutkan latihan dan melihat progresmu.":"Daftar gratis untuk menyimpan hasil latihan dan progres belajar."}</p>
      <form onSubmit={submit} className="mt-7 space-y-4">
        {mode==="signup"&&<label className="block text-sm font-semibold text-slate-700">Nama lengkap<input required value={name} onChange={e=>setName(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-blue-500" placeholder="Nama kamu"/></label>}
        <label className="block text-sm font-semibold text-slate-700">Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-blue-500" placeholder="nama@email.com"/></label>
        <label className="block text-sm font-semibold text-slate-700">Password<input required minLength={8} type="password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-blue-500" placeholder="Minimal 8 karakter"/></label>
        {message&&<p role="status" className="rounded-xl bg-blue-50 p-3 text-sm text-blue-800">{message}</p>}
        <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 font-bold text-white transition hover:bg-blue-700 disabled:opacity-60">{busy&&<LoaderCircle className="animate-spin" size={18}/>} {mode==="login"?"Masuk":"Daftar sekarang"}</button>
      </form>
      <Link href="/lupa-password" className="mt-4 block text-right text-sm font-semibold text-blue-700">Lupa password?</Link><p className="mt-6 text-center text-sm text-slate-500">{mode==="login"?"Belum punya akun?":"Sudah punya akun?"} <button onClick={()=>{setMode(mode==="login"?"signup":"login");setMessage("");}} className="font-bold text-blue-700">{mode==="login"?"Daftar":"Masuk"}</button></p>
      <Link href="/" className="mt-5 block text-center text-sm text-slate-400 hover:text-blue-700">Kembali ke beranda</Link>
    </section>
  </main>;
}
