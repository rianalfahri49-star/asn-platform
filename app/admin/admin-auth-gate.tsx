"use client";

import { useEffect, useRef, useState } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";

type Props = {
  client: SupabaseClient;
  user: User | null;
  onUserChange: (user: User | null) => void;
  onVerified: (user: User) => void;
};

async function functionError(error: unknown, data: unknown): Promise<string> {
  if (data && typeof data === "object" && "error" in data && typeof (data as {error?:unknown}).error === "string") {
    return (data as {error:string}).error;
  }
  const context = error && typeof error === "object" && "context" in error
    ? (error as {context?: {json?: () => Promise<unknown>}}).context
    : undefined;
  if (context?.json) {
    try {
      const body = await context.json();
      if (body && typeof body === "object" && "error" in body && typeof (body as {error?:unknown}).error === "string") {
        return (body as {error:string}).error;
      }
    } catch { /* use the SDK message below */ }
  }
  return error instanceof Error ? error.message : "Permintaan autentikasi gagal.";
}

export default function AdminAuthGate({ client, user, onUserChange, onVerified }: Props) {
  const onUserChangeRef = useRef(onUserChange);
  const onVerifiedRef = useRef(onVerified);
  onUserChangeRef.current = onUserChange;
  onVerifiedRef.current = onVerified;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [step, setStep] = useState<"login" | "otp">("login");

  useEffect(() => {
    if (!user) {
      setStep("login");
      return;
    }
    if (user.app_metadata?.role !== "admin") {
      void client.auth.signOut();
      onUserChangeRef.current(null);
      setMessage("Akun ini belum memiliki hak akses administrator.");
      setStep("login");
      return;
    }
    let cancelled = false;
    setStep("otp");
    setBusy(true);
    void (async () => {
      const status = await client.functions.invoke("admin-email-otp", { body: { action: "status" } });
      if (cancelled) return;
      if (!status.error && status.data?.verified === true) {
        setBusy(false);
        onVerifiedRef.current(user);
        return;
      }
      const sent = await client.functions.invoke("admin-email-otp", { body: { action: "send" } });
      if (cancelled) return;
      setBusy(false);
      if (sent.error || sent.data?.success !== true) {
        setMessage(await functionError(sent.error, sent.data));
      } else {
        setMessage("Kode verifikasi telah dikirim ke email administrator.");
      }
    })();
    return () => { cancelled = true; };
  }, [client, user]);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const { data, error } = await client.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    if (!data.user || data.user.app_metadata?.role !== "admin") {
      await client.auth.signOut();
      setMessage("Akun ini belum memiliki hak akses administrator.");
      return;
    }
    setPassword("");
    onUserChangeRef.current(data.user);
    setStep("otp");
    setMessage("Menyiapkan pengiriman kode verifikasi...");
  }

  async function resend() {
    setBusy(true);
    setMessage("");
    const { data, error } = await client.functions.invoke("admin-email-otp", { body: { action: "send" } });
    setBusy(false);
    setMessage(error || data?.success !== true
      ? await functionError(error, data)
      : "Kode verifikasi telah dikirim. Periksa kotak masuk dan folder spam.");
  }

  async function verify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setMessage("Masukkan kode OTP yang terdiri dari 6 digit.");
      return;
    }
    setBusy(true);
    setMessage("");
    const { data, error } = await client.functions.invoke("admin-email-otp", {
      body: { action: "verify", code: code.trim() },
    });
    setBusy(false);
    if (error || data?.success !== true) {
      setMessage(await functionError(error, data));
      return;
    }
    if (user) onVerifiedRef.current(user);
  }

  async function backToLogin() {
    await client.auth.signOut();
    onUserChangeRef.current(null);
    setCode("");
    setMessage("");
    setStep("login");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f7fb] p-5">
      <section className="w-full max-w-md rounded-3xl border bg-white p-8 shadow-xl">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-white">SC</div>
        <p className="mt-5 text-xs font-extrabold uppercase tracking-widest text-blue-600">Sukses CPNS</p>
        <h1 className="mt-2 text-2xl font-black text-[#10213f]">Admin Console</h1>
        {step === "login" || !user ? (
          <form onSubmit={login} className="mt-5">
            <p className="text-sm text-slate-500">Masuk menggunakan email administrator dan kata sandi.</p>
            <label className="mt-5 block text-sm font-semibold">Email</label>
            <input required type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border p-3" />
            <label className="mt-4 block text-sm font-semibold">Password</label>
            <input required type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border p-3" />
            <button disabled={busy} className="mt-6 w-full rounded-xl bg-blue-600 p-3 font-bold text-white disabled:opacity-50">{busy ? "Memeriksa..." : "Masuk"}</button>
          </form>
        ) : (
          <form onSubmit={verify} className="mt-5">
            <p className="text-sm leading-6 text-slate-500">Verifikasi dua langkah diperlukan. Masukkan kode 6 digit yang dikirim ke email akun administrator.</p>
            <label className="mt-5 block text-sm font-semibold">Kode OTP</label>
            <input required inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} className="mt-2 w-full rounded-xl border p-3 text-center text-2xl font-black tracking-[0.5em]" />
            <button disabled={busy || code.length !== 6} className="mt-5 w-full rounded-xl bg-blue-600 p-3 font-bold text-white disabled:opacity-50">{busy ? "Memverifikasi..." : "Verifikasi OTP"}</button>
            <button type="button" disabled={busy} onClick={() => void resend()} className="mt-3 w-full rounded-xl border p-3 text-sm font-semibold disabled:opacity-50">Kirim ulang kode</button>
            <button type="button" disabled={busy} onClick={() => void backToLogin()} className="mt-3 w-full p-2 text-sm text-slate-500">Gunakan akun lain</button>
          </form>
        )}
        {message && <p role="status" className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{message}</p>}
        <p className="mt-5 text-xs leading-5 text-slate-400">Kode OTP berlaku 5 menit, hanya dapat digunakan sekali, dan dibatasi jumlah percobaan. Jangan bagikan kode kepada siapa pun.</p>
      </section>
    </main>
  );
}
