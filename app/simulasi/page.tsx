"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { ArrowLeft, CheckCircle2, Clock3, Flag, LoaderCircle, RotateCcw } from "lucide-react";
import { getExamReviewAction, submitExamAction, type ExamReviewItem, type RawExamAnswer } from "./actions";

type Question = {
  id: string;
  category: "TWK" | "TIU" | "TKP";
  topic: string;
  question: string;
  options: string[];
};
type Result = {
  attempt_id: string;
  total_questions: number;
  correct_answers: number;
  score: number;
};

const LETTERS = ["A", "B", "C", "D", "E"];
const MAX_LIMIT = 110 * 60;
const SECONDS_PER_QUESTION = 60;

function shuffleQuestions(items: Question[]) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function clock(seconds: number) {
  return Math.floor(seconds / 60).toString().padStart(2, "0") + ":" +
    Math.max(0, seconds % 60).toString().padStart(2, "0");
}

export default function SimulasiPage() {
  const db = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return url && key ? createBrowserClient(url, key) : null;
  }, []);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [marked, setMarked] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [review, setReview] = useState<ExamReviewItem[]>([]);

  const load = useCallback(async () => {
    if (!db) {
      setError("Simulasi memerlukan koneksi Supabase. Silakan hubungi admin.");
      return;
    }
    setLoading(true);
    setError("");
    const { data, error: loadError } = await db
      .from("questions")
      .select("id,category,topic,question,options")
      .eq("is_published", true)
      .eq("is_premium", false)
      .limit(110);
    if (loadError) setError(loadError.message);
    else {
      const shuffled = shuffleQuestions((data || []) as Question[]);
      setQuestions(shuffled);
      setRemaining(Math.min(MAX_LIMIT, shuffled.length * SECONDS_PER_QUESTION));
    }
    setLoading(false);
  }, [db]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!db) return;
    let active = true;
    void db.auth.getUser().then(({ data }) => {
      if (active) setIsAuthenticated(Boolean(data.user));
    });
    const { data: { subscription } } = db.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session?.user));
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [db]);

  const answeredCount = questions.filter((item) => Boolean(answers[item.id])).length;
  const markedCount = marked.length;
  const unansweredCount = Math.max(0, questions.length - answeredCount);
  const current = questions[idx];

  const finish = useCallback(async () => {
    if (submitting || done || !questions.length) return;
    setSubmitting(true);
    setError("");

    const rawAnswers: RawExamAnswer[] = questions.map((item) => ({
      question_id: item.id,
      answer: answers[item.id] ?? null,
      is_marked: marked.includes(item.id),
    }));

    const sessionLimit = Math.min(MAX_LIMIT, questions.length * SECONDS_PER_QUESTION);
    const response = await submitExamAction(rawAnswers, sessionLimit - remaining);
    if (!response.success) {
      setError(response.error);
      setSubmitting(false);
      return;
    }

    const reviewResponse = await getExamReviewAction(response.result.attempt_id);
    if (reviewResponse.success) setReview(reviewResponse.items);
    else setError(reviewResponse.error);

    setResult(response.result);
    setDone(true);
    setStarted(false);
    setShowConfirmModal(false);
    setSubmitting(false);
  }, [answers, done, marked, questions, remaining, submitting]);

  useEffect(() => {
    if (!started || done || submitting) return;
    if (remaining <= 0) {
      void finish();
      return;
    }
    const timer = window.setTimeout(() => setRemaining((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [started, done, submitting, remaining, finish]);

  function reset() {
    setAnswers({});
    setMarked([]);
    setIdx(0);
    setRemaining(0);
    setStarted(false);
    setDone(false);
    setSubmitting(false);
    setShowConfirmModal(false);
    setError("");
    setResult(null);
    setReview([]);
    void load();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600">
            <ArrowLeft size={17} /> Beranda
          </Link>
          <b>Sukses<span className="text-blue-600">CPNS</span></b>
          <span className="text-xs font-bold text-slate-400">Simulasi CAT</span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8">
        <p className="text-xs font-extrabold uppercase tracking-widest text-blue-600">Ujian berbatas waktu</p>
        <h1 className="mt-2 text-3xl font-black">Simulasi CAT SKD</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Simulasi menggunakan soal yang diterbitkan admin. Durasi mengikuti jumlah soal yang tersedia (1 menit per soal, maksimal 110 menit). Sesi dikumpulkan otomatis saat waktu habis.
        </p>

        {!started && !done && (
          <section className="mt-7 rounded-3xl border bg-white p-7">
            <h2 className="text-xl font-black">Persiapan ujian</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-blue-50 p-4">
                <p className="text-xs text-blue-700">Durasi</p>
                <p className="mt-1 text-2xl font-black text-blue-950">{loading ? "Memuat..." : `${Math.ceil(Math.min(MAX_LIMIT, questions.length * SECONDS_PER_QUESTION) / 60)} menit`}</p>
              </div>
              <div className="rounded-2xl bg-blue-50 p-4">
                <p className="text-xs text-blue-700">Soal tersedia</p>
                <p className="mt-1 text-2xl font-black text-blue-950">{loading ? "Memuat..." : questions.length}</p>
              </div>
              <div className="rounded-2xl bg-blue-50 p-4">
                <p className="text-xs text-blue-700">Subtes</p>
                <p className="mt-1 text-2xl font-black text-blue-950">TWK · TIU · TKP</p>
              </div>
            </div>
            {!loading && !questions.length && <p className="mt-5 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Belum ada soal yang dapat dimuat. Silakan coba muat ulang halaman atau hubungi admin jika masalah berlanjut.</p>}
            <p className="mt-5 text-sm text-slate-500">
              Catatan: tersedia 110 soal latihan (30 TWK, 35 TIU, 45 TKP). TWK/TIU menggunakan 5 poin untuk jawaban tepat; TKP menggunakan bobot latihan 1–5. Skema ini adalah penilaian latihan internal, bukan perhitungan atau passing grade resmi BKN.
            </p>
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            {!isAuthenticated && <p className="mt-4 text-sm text-amber-700">Masuk terlebih dahulu untuk memulai dan menyimpan hasil simulasi. <Link href="/masuk?next=/simulasi" className="font-bold underline">Masuk / daftar</Link></p>}
            <button
              disabled={!questions.length || loading || !isAuthenticated}
              onClick={() => setStarted(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white disabled:opacity-40"
            >
              {loading && <LoaderCircle className="animate-spin" size={17} />}
              Mulai simulasi
            </button>
          </section>
        )}

        {started && current && (
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_280px]">
            <section className="rounded-3xl border bg-white p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                  {current.category} · {current.topic}
                </span>
                <span className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 font-mono font-black text-amber-800">
                  <Clock3 size={16} />{clock(remaining)}
                </span>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500">Soal {idx + 1} dari {questions.length}</span>
                <button
                  onClick={() => setMarked((items) => items.includes(current.id) ? items.filter((id) => id !== current.id) : [...items, current.id])}
                  className={"inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold " + (marked.includes(current.id) ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600")}
                >
                  <Flag size={14} />{marked.includes(current.id) ? "Hapus tanda ragu" : "Tandai ragu-ragu"}
                </button>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-blue-600" style={{ width: ((idx + 1) / questions.length * 100) + "%" }} />
              </div>

              <h2 className="mt-7 text-lg font-bold leading-8 text-slate-900">{current.question}</h2>
              <div className="mt-6 space-y-3">
                {current.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setAnswers((items) => ({ ...items, [current.id]: LETTERS[index] }))}
                    className={"flex w-full items-start gap-3 rounded-2xl border p-4 text-left " + (answers[current.id] === LETTERS[index] ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:bg-slate-50")}
                  >
                    <span className="font-black">{LETTERS[index]}.</span>
                    <span className="text-sm leading-6 text-slate-700">{option}</span>
                  </button>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap justify-between gap-3">
                <button disabled={idx === 0} onClick={() => setIdx((value) => value - 1)} className="rounded-xl border px-4 py-3 text-sm font-bold disabled:opacity-30">
                  Sebelumnya
                </button>
                <button onClick={() => setIdx((value) => Math.min(questions.length - 1, value + 1))} disabled={idx === questions.length - 1} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-30">
                  Soal berikutnya
                </button>
              </div>
            </section>

            <aside className="h-fit rounded-3xl border bg-white p-5">
              <h3 className="font-black">Navigasi soal</h3>
              <p className="mt-1 text-xs text-slate-500">{answeredCount} dijawab · {markedCount} ragu-ragu</p>
              <div className="mt-4 grid grid-cols-5 gap-2">
                {questions.map((item, index) => {
                  const isMarked = marked.includes(item.id);
                  const isAnswered = Boolean(answers[item.id]);
                  const statusClass = isMarked
                    ? "bg-amber-400 text-slate-900 hover:bg-amber-500"
                    : isAnswered
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-slate-200 text-slate-700 hover:bg-slate-300";
                  return (
                    <button
                      key={item.id}
                      onClick={() => setIdx(index)}
                      aria-label={"Ke soal " + (index + 1)}
                      aria-current={idx === index ? "step" : undefined}
                      className={"h-10 rounded-lg text-xs font-bold " + statusClass + (idx === index ? " ring-2 ring-blue-800 ring-offset-2" : "")}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 space-y-1 text-xs text-slate-500">
                <p><span className="mr-2 inline-block h-2.5 w-2.5 rounded-sm bg-blue-600" />Sudah dijawab</p>
                <p><span className="mr-2 inline-block h-2.5 w-2.5 rounded-sm bg-amber-400" />Ragu-ragu</p>
                <p><span className="mr-2 inline-block h-2.5 w-2.5 rounded-sm bg-slate-200" />Belum dijawab</p>
              </div>
              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={submitting}
                className="mt-6 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                Kumpulkan ujian
              </button>
            </aside>
          </div>
        )}

        {done && result && (
          <section className="mt-7 rounded-3xl border bg-white p-8 text-center">
            <CheckCircle2 className="mx-auto text-emerald-600" size={42} />
            <h2 className="mt-4 text-2xl font-black">Simulasi selesai</h2>
            <div className="mx-auto mt-6 grid max-w-lg grid-cols-2 gap-3">
              <div className="rounded-2xl bg-blue-50 p-5">
                <p className="text-sm text-blue-700">Skor latihan · maks. 550</p>
                <p className="mt-1 text-3xl font-black">{result.score}</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-5">
                <p className="text-sm text-emerald-700">Pilihan terbaik</p>
                <p className="mt-1 text-3xl font-black">{result.correct_answers}/{result.total_questions}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">Waktu digunakan {clock(Math.min(MAX_LIMIT, questions.length * SECONDS_PER_QUESTION) - remaining)}. Skor dihitung dan disimpan di server.</p>
            <p className="mt-3 text-sm font-bold text-emerald-700">Hasil tersimpan di riwayat akun.</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">Skor merupakan evaluasi latihan internal. Bobot TKP 1–5 dan nilai TWK/TIU bukan klaim skor resmi atau passing grade seleksi ASN.</p>
            <div className="mt-8 text-left">
              <h3 className="text-xl font-black text-slate-900">Pembahasan jawaban</h3>
              <p className="mt-1 text-sm text-slate-500">Pelajari alasan jawaban benar untuk setiap soal.</p>
              {review.length === 0 ? (
                <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">Pembahasan belum tersedia untuk sesi ini.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {review.map((item, index) => (
                    <article key={item.question_id} className="rounded-2xl border border-slate-200 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-extrabold uppercase tracking-wide text-blue-700">{item.category} · {item.topic}</span>
                        <span className="text-xs font-bold text-slate-400">Soal {index + 1}</span>
                      </div>
                      <h4 className="mt-3 font-bold leading-7 text-slate-900">{item.question}</h4>
                      <div className="mt-3 space-y-2">
                        {item.options.map((option, optionIndex) => {
                          const letter = LETTERS[optionIndex];
                          const isCorrect = letter === item.correct_answer;
                          const isSelected = letter === item.selected_answer;
                          return (
                            <div key={letter} className={"rounded-xl border px-3 py-2 text-sm " + (isCorrect ? "border-emerald-300 bg-emerald-50 text-emerald-900" : isSelected ? "border-rose-300 bg-rose-50 text-rose-900" : "border-slate-100 text-slate-600")}>
                              <span className="mr-2 font-black">{letter}.</span>{option}
                              {isCorrect && <span className="ml-2 font-bold">· Pilihan terbaik</span>}
                              {!isCorrect && isSelected && <span className="ml-2 font-bold">· Jawabanmu</span>}
                            </div>
                          );
                        })}
                      </div>
                      <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700"><b>Pembahasan:</b> {item.explanation || "Belum ada penjelasan untuk soal ini."}</p>
                      {item.category === "TKP" && <p className="mt-2 text-xs font-bold text-blue-700">Poin respons latihan: {item.selected_score}/5</p>}
                    </article>
                  ))}
                </div>
              )}
            </div>
            <button onClick={reset} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white">
              <RotateCcw size={16} />Ulangi simulasi
            </button>
          </section>
        )}

        {showConfirmModal && started && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4" role="presentation">
            <section role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
              <h2 id="confirm-title" className="text-xl font-black text-slate-900">Kumpulkan ujian sekarang?</h2>
              <p className="mt-2 text-sm text-slate-600">Periksa ringkasan jawaban sebelum mengakhiri simulasi.</p>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-blue-50 p-3">
                  <p className="text-2xl font-black text-blue-700">{answeredCount}</p>
                  <p className="text-xs text-blue-800">Dijawab</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-3">
                  <p className="text-2xl font-black text-amber-700">{markedCount}</p>
                  <p className="text-xs text-amber-800">Ragu-ragu</p>
                </div>
                <div className="rounded-xl bg-slate-100 p-3">
                  <p className="text-2xl font-black text-slate-700">{unansweredCount}</p>
                  <p className="text-xs text-slate-600">Kosong</p>
                </div>
              </div>
              {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
              <div className="mt-6 flex gap-3">
                <button onClick={() => { setShowConfirmModal(false); setError(""); }} disabled={submitting} className="flex-1 rounded-xl border px-4 py-3 text-sm font-bold text-slate-700 disabled:opacity-50">
                  Batal
                </button>
                <button onClick={() => void finish()} disabled={submitting} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">
                  {submitting && <LoaderCircle size={16} className="animate-spin" />}
                  {submitting ? "Mengirim..." : "Ya, Kumpulkan"}
                </button>
              </div>
            </section>
          </div>
        )}

        {error && !showConfirmModal && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    </main>
  );
}
