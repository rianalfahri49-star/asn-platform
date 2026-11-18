"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, Check, Smartphone } from "lucide-react";

const features = [
  "Akses materi belajar reguler CPNS dan PPPK",
  "Latihan soal TWK, TIU, dan TKP yang tersedia di website",
  "Simulasi CAT dan riwayat hasil latihan",
  "Rangkuman materi dan video pembelajaran yang tersedia",
  "Progres belajar dan profil pengguna",
];

export default function PaketPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600">
            <ArrowLeft size={17} /> Beranda
          </Link>
          <span className="font-black">Sukses<span className="text-blue-600">CPNS</span></span>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-blue-100 text-blue-700">
            <BookOpen />
          </span>
          <p className="mt-5 text-xs font-extrabold uppercase tracking-widest text-blue-600">Paket website</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Paket Reguler</h1>
          <p className="mt-3 leading-7 text-slate-600">
            Belajar dan berlatih persiapan CPNS dan PPPK melalui website SuksesCPNS.
          </p>
        </div>

        <section className="mx-auto mt-10 max-w-xl rounded-3xl border border-blue-200 bg-white p-7 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black text-slate-950">Reguler</h2>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Gratis</span>
          </div>
          <p className="mt-5 text-4xl font-black text-slate-950">Rp0</p>
          <p className="mt-1 text-sm text-slate-500">Untuk semua pengguna website</p>

          <ul className="mt-7 space-y-3">
            {features.map((feature) => (
              <li key={feature} className="flex gap-2 text-sm text-slate-600">
                <Check size={17} className="shrink-0 text-emerald-600" />
                {feature}
              </li>
            ))}
          </ul>

          <Link
            href="/masuk"
            className="mt-8 flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700"
          >
            Mulai belajar gratis
          </Link>
        </section>

        <section className="mx-auto mt-6 max-w-xl rounded-2xl border border-slate-200 bg-slate-100 p-5">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-slate-700">
              <Smartphone size={20} />
            </span>
            <div>
              <h2 className="font-bold text-slate-900">Paket Premium tersedia di aplikasi SuksesCPNS</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Website ini hanya menyediakan Paket Reguler. Jika membutuhkan fitur Premium, pengguna dapat menggunakan aplikasi SuksesCPNS.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
