"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, LoaderCircle, RotateCcw } from "lucide-react";
import { getExamReviewAction, submitExamAction, type ExamReviewItem, type RawExamAnswer } from "../simulasi/actions";

type Question = { id: string; category: "TWK" | "TIU" | "TKP"; topic: string; question: string; options: string[] };
type Result = { attempt_id: string; total_questions: number; correct_answers: number; score: number };
const LETTERS = ["A", "B", "C", "D", "E"];

function shuffleQuestions(items: Question[]) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function formatTime(seconds: number) {
  return Math.floor(seconds / 60).toString().padStart(2, "0") + ":" +
    Math.max(0, seconds % 60).toString().padStart(2, "0");
}

export default function LatihanPage() {
  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return url && key ? createBrowserClient(url, key) : null;
  }, []);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [category, setCategory] = useState("SEMUA");
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [review, setReview] = useState<ExamReviewItem[]>([]);

  const load = useCallback(async () => {
    if (!supabase) {
      setError("Bank soal belum aktif. Supabase perlu dikonfigurasi oleh admin.");
      return;
    }
    setLoading(true);
    setError("");
    let query = supabase
      .from("questions")
      .select("id,category,topic,question,options")
      .eq("is_published", true)
      .eq("is_premium", false)
      .limit(110);
    if (category !== "SEMUA") query = query.eq("category", category);
    const { data, error: loadError } = await query;
    if (loadError) setError(loadError.message);
    else setQuestions(shuffleQuestions((data || []) as Question[]));
    setLoading(false);
  }, [supabase, category]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (active) setIsAuthenticated(Boolean(data.user));
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session?.user));
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!started || finished) return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [started, finished]);

  const current = questions[index];
  const answered = Object.keys(answers).length;

  async function finish() {
    if (submitting || finished || !questions.length) return;
    setSubmitting(true);
    setError("");
    const rawAnswers: RawExamAnswer[] = questions.map((item) => ({
      question_id: item.id,
      answer: answers[item.id] ?? null,
      is_marked: false,
    }));
    const title = "Latihan " + (category === "SEMUA" ? "SKD" : category);
    const response = await submitExamAction(rawAnswers, seconds, title, category === "SEMUA" ? "SKD" : category);
    if (!response.success) {
      setError(response.error);
      setSubmitting(false);
      return;
    }
    setResult(response.result);
    const reviewResponse = await getExamReviewAction(response.result.attempt_id);
    if (reviewResponse.success) setReview(reviewResponse.items);
    else setError(reviewResponse.error);
    setFinished(true);
    setStarted(false);
    setSubmitting(false);
  }

  function restart() {
    setAnswers({});
    setIndex(0);
    setSeconds(0);
    setStarted(false);
    setFinished(false);
    setSubmitting(false);
    setError("");
    setResult(null);
    setReview([]);
    void load();
  }

  if (loading && !questions.length) {
    return <main className="grid min-h-screen place-items-center"><LoaderCircle className="animate-spin text-blue-600" /></main>;
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600"><ArrowLeft size={17} /> Beranda</Link>
          <span className="font-black text-slate-900">Sukses<span className="text-blue-600">CPNS</span></span>
          <span className="text-xs font-semibold text-slate-400">Mode latihan</span>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-8">
        <div className="mb-7">
          <p className="text-xs font-extrabold uppercase tracking-widest text-blue-600">Ruang latihan</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">Asah kemampuanmu</h1>
          <p className="mt-2 text-slate-600">Pilih subtes dan kerjakan soal dari bank soal yang sudah diterbitkan admin.</p>
        </div>

        {!started && !finished && (
          <section className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-extrabold">Atur sesi latihan</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {["SEMUA", "TWK", "TIU", "TKP"].map((value) => (
                <button key={value} onClick={() => { setCategory(value); setAnswers({}); setIndex(0); }} className={"rounded-full px-4 py-2 text-sm font-bold " + (category === value ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600")}>
                  {value === "SEMUA" ? "Semua subtes" : value}
                </button>
              ))}
            </div>
            <div className="mt-5 rounded-2xl bg-blue-50 p-4 text-sm text-blue-900">
              {questions.length ? questions.length + " soal tersedia untuk sesi ini." : "Belum ada soal terbit pada kategori ini."}
              <span className="mt-1 block text-blue-700">TWK/TIU bernilai 5 untuk jawaban tepat; TKP memakai bobot latihan 1–5. Ini skema evaluasi internal, bukan perhitungan atau passing grade resmi BKN.</span>
            </div>
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            {!isAuthenticated && <p className="mt-4 text-sm text-amber-700">Masuk terlebih dahulu untuk memulai dan menyimpan hasil latihan. <Link href="/masuk?next=/latihan" className="font-bold underline">Masuk / daftar</Link></p>}
            <button disabled={!questions.length || loading || !isAuthenticated} onClick={() => setStarted(true)} className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">
              Mulai latihan
            </button>
          </section>
        )}

        {started && current && (
          <>
            <div className="mb-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border bg-white p-4"><p className="text-xs text-slate-500">Progres</p><p className="mt-1 text-xl font-black">{index + 1} / {questions.length}</p></div>
              <div className="rounded-2xl border bg-white p-4"><p className="text-xs text-slate-500">Terjawab</p><p className="mt-1 text-xl font-black">{answered} soal</p></div>
              <div className="rounded-2xl border bg-white p-4"><p className="flex items-center gap-2 text-xs text-slate-500"><Clock3 size={14} /> Waktu berjalan</p><p className="mt-1 text-xl font-black tabular-nums">{formatTime(seconds)}</p></div>
            </div>
            <section className="rounded-3xl border bg-white p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{current.category} · {current.topic}</span>
                <span className="text-xs text-slate-400">Soal {index + 1}</span>
              </div>
              <h2 className="mt-6 text-lg font-bold leading-8 text-slate-900">{current.question}</h2>
              <div className="mt-6 space-y-3">
                {current.options.map((option, optionIndex) => {
                  const letter = LETTERS[optionIndex];
                  return (
                    <button key={letter} onClick={() => setAnswers((items) => ({ ...items, [current.id]: letter }))} className={"flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition " + (answers[current.id] === letter ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-200 hover:bg-slate-50")}>
                      <span className={"grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-black " + (answers[current.id] === letter ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600")}>{letter}</span>
                      <span className="pt-1 text-sm leading-6 text-slate-700">{option}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                <button disabled={index === 0} onClick={() => setIndex((value) => value - 1)} className="rounded-xl border px-4 py-3 text-sm font-bold text-slate-600 disabled:opacity-30">Sebelumnya</button>
                <div className="flex gap-2">
                  <button onClick={() => setIndex((value) => Math.min(questions.length - 1, value + 1))} disabled={index === questions.length - 1} className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 disabled:opacity-40">Berikutnya <ArrowRight size={16} /></button>
                  <button onClick={() => void finish()} disabled={submitting} className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{submitting ? "Mengirim..." : "Selesaikan"}</button>
                </div>
              </div>
              {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            </section>
            <div className="mt-4 flex flex-wrap gap-2">
              {questions.map((item, questionIndex) => (
                <button key={item.id} onClick={() => setIndex(questionIndex)} aria-label={"Ke soal " + (questionIndex + 1)} className={"h-9 w-9 rounded-lg text-xs font-bold " + (index === questionIndex ? "bg-blue-600 text-white" : answers[item.id] ? "bg-blue-100 text-blue-800" : "border bg-white text-slate-500")}>{questionIndex + 1}</button>
              ))}
            </div>
          </>
        )}

        {finished && result && (
          <section className="rounded-3xl border bg-white p-7 text-center shadow-sm">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600"><CheckCircle2 size={28} /></span>
            <h2 className="mt-4 text-2xl font-black">Latihan selesai!</h2>
            <p className="mt-2 text-slate-500">Hasil sesi latihanmu dihitung oleh server</p>
            <div className="mx-auto mt-6 grid max-w-lg grid-cols-2 gap-3">
              <div className="rounded-2xl bg-blue-50 p-5"><p className="text-sm text-blue-700">Skor latihan</p><p className="mt-1 text-3xl font-black text-blue-900">{result.score}</p></div>
              <div className="rounded-2xl bg-emerald-50 p-5"><p className="text-sm text-emerald-700">Pilihan terbaik</p><p className="mt-1 text-3xl font-black text-emerald-900">{result.correct_answers}/{result.total_questions}</p></div>
            </div>
            <p className="mt-4 text-sm text-slate-500">Waktu: {formatTime(seconds)} · {answered} soal dijawab</p>
            <p className="mt-3 text-sm font-semibold text-emerald-700">Hasil tersimpan di akunmu.</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">Skor latihan internal: TWK/TIU 5 atau 0 poin, TKP 1–5 poin. Nilai ini bukan skor resmi atau passing grade seleksi ASN.</p>
            {review.length > 0 && <div className="mt-8 space-y-4 text-left"><h3 className="text-xl font-black">Pembahasan jawaban</h3>{review.map((item,index)=><article key={item.question_id} className="rounded-2xl border p-5"><div className="flex justify-between gap-3 text-xs font-bold text-blue-700"><span>{item.category} · {item.topic}</span><span>Soal {index+1}</span></div><h4 className="mt-3 font-bold leading-7">{item.question}</h4><div className="mt-3 space-y-2">{item.options.map((option,i)=>{const letter=LETTERS[i];const correct=letter===item.correct_answer;const selected=letter===item.selected_answer;return <div key={letter} className={"rounded-xl border px-3 py-2 text-sm "+(correct?"border-emerald-300 bg-emerald-50 text-emerald-900":selected?"border-rose-300 bg-rose-50 text-rose-900":"border-slate-100 text-slate-600")}><b className="mr-2">{letter}.</b>{option}{correct&&<b className="ml-2">· Jawaban terbaik</b>}{!correct&&selected&&<b className="ml-2">· Jawabanmu</b>}</div>;})}</div><p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700"><b>Pembahasan:</b> {item.explanation||"Belum ada pembahasan."}</p>{item.category==="TKP"&&<p className="mt-2 text-xs font-bold text-blue-700">Poin respons latihan: {item.selected_score}/5</p>}</article>)}</div>}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button onClick={restart} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white"><RotateCcw size={16} /> Latihan lagi</button>
              <Link href="/akun" className="rounded-xl border px-5 py-3 font-bold text-slate-700">Lihat progres</Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
