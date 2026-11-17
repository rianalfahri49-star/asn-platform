"use client";
import Link from "next/link";
import {FormEvent,useMemo,useState} from "react";
import {useRouter} from "next/navigation";
import {createBrowserClient} from "@supabase/ssr";
import {KeyRound} from "lucide-react";
export default function ResetPasswordPage(){
 const router=useRouter();const db=useMemo(()=>{const u=process.env.NEXT_PUBLIC_SUPABASE_URL,k=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;return u&&k?createBrowserClient(u,k):null;},[]);
 const [password,setPassword]=useState("");const [confirm,setConfirm]=useState("");const [message,setMessage]=useState("");const [busy,setBusy]=useState(false);
 async function submit(e:FormEvent){e.preventDefault();if(password.length<8){setMessage("Password minimal 8 karakter.");return;}if(password!==confirm){setMessage("Konfirmasi password belum sama.");return;}if(!db){setMessage("Layanan akun belum dikonfigurasi.");return;}setBusy(true);const {error}=await db.auth.updateUser({password});setBusy(false);if(error)setMessage(error.message);else{setMessage("Password berhasil diperbarui. Mengarahkan ke halaman masuk...");window.setTimeout(()=>router.push("/masuk"),1200);}}
 return <main className="grid min-h-screen place-items-center bg-slate-50 p-5"><section className="w-full max-w-md rounded-3xl border bg-white p-8 shadow-xl"><KeyRound className="text-blue-600" size={30}/><h1 className="mt-4 text-2xl font-black">Buat password baru</h1><p className="mt-2 text-sm text-slate-500">Gunakan password minimal 8 karakter.</p><form onSubmit={submit} className="mt-6 space-y-4"><input type="password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password baru" className="w-full rounded-xl border p-3"/><input type="password" minLength={8} required value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Ulangi password baru" className="w-full rounded-xl border p-3"/><button disabled={busy} className="w-full rounded-xl bg-blue-600 p-3 font-bold text-white disabled:opacity-50">{busy?"Menyimpan...":"Simpan password baru"}</button></form>{message&&<p role="status" className="mt-4 text-sm text-blue-700">{message}</p>}<Link href="/masuk" className="mt-5 block text-center text-sm text-slate-500">Kembali ke masuk</Link></section></main>;
}
