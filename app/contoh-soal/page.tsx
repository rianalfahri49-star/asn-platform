"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Lightbulb, RotateCcw } from "lucide-react";

const examples = [
  {
    code: "TWK",
    title: "Tes Wawasan Kebangsaan",
    topic: "Pancasila dan persatuan",
    question: "Di lingkungan kerja yang terdiri dari beragam suku dan budaya, tindakan yang paling mencerminkan sila ketiga Pancasila adalah ...",
    options: [
      "Mengutamakan kebiasaan kelompok sendiri agar pekerjaan lebih cepat",
      "Bekerja sama dengan semua rekan dan menghargai perbedaan",
      "Menghindari rekan yang memiliki pandangan berbeda",
      "Menyerahkan keputusan kepada kelompok mayoritas",
      "Membatasi komunikasi hanya dengan rekan yang dikenal",
    ],
    answer: 1,
    explanation: "Sila ketiga, Persatuan Indonesia, mendorong persatuan di tengah keberagaman. Kerja sama yang menghargai perbedaan memperkuat kebersamaan tanpa menghapus identitas masing-masing.",
  },
  {
    code: "TIU",
    title: "Tes Intelegensia Umum",
    topic: "Analogi verbal",
    question: "Kompas : arah = termometer : ...",
    options: ["Jarak", "Suhu", "Waktu", "Berat", "Kecepatan"],
    answer: 1,
    explanation: "Kompas merupakan alat untuk menunjukkan arah, sedangkan termometer merupakan alat untuk mengukur suhu. Hubungan kedua pasangan adalah alat dan besaran yang diukur atau ditunjukkan.",
  },
  {
    code: "TKP",
    title: "Tes Karakteristik Pribadi",
    topic: "Profesionalisme dan prioritas",
    question: "Anda menerima tugas mendadak ketika beberapa pekerjaan lain juga mendekati tenggat. Apa tindakan paling tepat?",
    options: [
      "Mengerjakan tugas yang paling mudah terlebih dahulu tanpa melihat tenggat",
      "Mengabaikan tugas baru sampai semua pekerjaan lama selesai",
      "Mengonfirmasi prioritas kepada atasan, menyusun urutan kerja, lalu menyampaikan kendala secara profesional",
      "Meminta rekan mengambil alih seluruh pekerjaan tanpa koordinasi",
      "Mengerjakan semuanya sekaligus tanpa membuat rencana",
    ],
    answer: 2,
    explanation: "Respons terbaik menunjukkan kemampuan mengelola prioritas, komunikasi, tanggung jawab, dan koordinasi. Mengonfirmasi urgensi membantu memastikan pekerjaan penting diselesaikan sesuai harapan.",
  },
];

export default function ContohSoalPage() {
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const item = examples[active];

  function changeExample(index: number) {
    setActive(index);
    setSelected(null);
    setRevealed(false);
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600"><ArrowLeft size={17} /> Beranda</Link>
          <span className="font-black text-slate-900">Sukses<span className="text-emerald-700">CPNS</span></span>
          <span className="text-xs font-semibold text-slate-400">Contoh gratis</span>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-8 sm:py-12">
        <div className="max-w-2xl">
          <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-700">Coba sebelum mendaftar</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Kenali cara belajar di Sukses CPNS.</h1>
          <p className="mt-3 leading-7 text-slate-600">Pilih satu contoh soal dari TWK, TIU, atau TKP. Jawab terlebih dahulu, lalu lihat pembahasan dan alasan di balik jawabannya. Tidak perlu masuk atau membuat akun.</p>
        </div>

        <div className="mt-7 flex flex-wrap gap-2" role="tablist" aria-label="Kategori contoh soal">
          {examples.map((example, index) => (
            <button key={example.code} type="button" role="tab" aria-selected={active === index} onClick={() => changeExample(index)} className={"rounded-full px-5 py-2.5 text-sm font-extrabold transition " + (active === index ? "bg-emerald-700 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:bg-emerald-50")}>
              {example.code}
            </button>
          ))}
        </div>

        <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8" aria-labelledby="sample-question">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-800">{item.title}</span>
            <span className="text-xs font-semibold text-slate-400">Contoh {active + 1} dari 3</span>
          </div>
          <p className="mt-5 text-xs font-bold uppercase tracking-wide text-slate-400">{item.topic}</p>
          <h2 id="sample-question" className="mt-2 text-lg font-extrabold leading-8 text-slate-900 sm:text-xl">{item.question}</h2>

          <div className="mt-6 space-y-3">
            {item.options.map((option, index) => {
              const isCorrect = revealed && index === item.answer;
              const isWrongSelected = revealed && selected === index && index !== item.answer;
              const isSelected = selected === index;
              return (
                <button key={option} type="button" disabled={revealed} onClick={() => setSelected(index)} className={"flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition " + (isCorrect ? "border-emerald-400 bg-emerald-50" : isWrongSelected ? "border-rose-300 bg-rose-50" : isSelected ? "border-emerald-400 bg-emerald-50/60" : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-slate-50")}>
                  <span className={"grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-black " + (isCorrect ? "bg-emerald-700 text-white" : isWrongSelected ? "bg-rose-600 text-white" : isSelected ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-600")}>{String.fromCharCode(65 + index)}</span>
                  <span className="pt-1 text-sm leading-6 text-slate-700">{option}</span>
                  {isCorrect && <CheckCircle2 className="ml-auto mt-1 shrink-0 text-emerald-700" size={18} />}
                </button>
              );
            })}
          </div>

          {revealed ? (
            <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 sm:p-5">
              <p className="flex items-center gap-2 font-extrabold text-emerald-900"><Lightbulb size={18} /> Pembahasan</p>
              <p className="mt-2 text-sm leading-7 text-emerald-950">{item.explanation}</p>
              <p className="mt-3 text-sm font-extrabold text-emerald-800">{selected === item.answer ? "Tepat! Jawabanmu benar." : "Belum tepat. Pelajari alasan jawaban yang benar di atas."}</p>
            </div>
          ) : (
            <p className="mt-4 text-xs text-slate-500">Pilih satu jawaban untuk mengaktifkan pemeriksaan jawaban.</p>
          )}

          <div className="mt-6 flex flex-wrap justify-between gap-3">
            <button type="button" onClick={() => { setSelected(null); setRevealed(false); }} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"><RotateCcw size={16} /> Ulangi soal</button>
            {!revealed ? (
              <button type="button" disabled={selected === null} onClick={() => setRevealed(true)} className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-extrabold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40">Periksa jawaban</button>
            ) : (
              <button type="button" onClick={() => changeExample((active + 1) % examples.length)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-extrabold text-white hover:bg-emerald-800">Contoh berikutnya <ArrowRight size={16} /></button>
            )}
          </div>
        </section>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-extrabold text-slate-900">Ingin latihan lebih banyak?</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">Bank latihan Sukses CPNS memiliki 110 soal gratis yang dapat dikerjakan setelah masuk agar hasil latihan tersimpan di akunmu.</p>
          <Link href="/masuk?next=/latihan" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-extrabold text-white hover:bg-emerald-800">Lanjut ke latihan <ArrowRight size={16} /></Link>
        </div>

        <p className="mt-5 text-center text-xs leading-6 text-slate-400">Contoh soal orisinal untuk demonstrasi pembelajaran. Bukan soal resmi atau bocoran seleksi BKN.</p>
      </div>
    </main>
  );
}
