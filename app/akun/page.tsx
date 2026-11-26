"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { ArrowLeft, BookOpen, Flame, LogOut, Target, Trophy } from "lucide-react";

type Attempt = {
  id: string;
  title: string;
  category: string;
  total_questions: number;
  correct_answers: number;
  score: number;
  duration_seconds: number;
  completed_at: string;
};
type StudyDay = {
  activity_date: string;
  questions_answered: number;
  sessions_completed: number;
};

function jakartaDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function previousDateKey(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

export default function AkunPage() {
  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return url && key ? createBrowserClient(url, key) : null;
  }, []);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [leaderboard, setLeaderboard] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(10);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [studyDays, setStudyDays] = useState<StudyDay[]>([]);
  const [message, setMessage] = useState("Memuat akun...");

  useEffect(() => {
    let active = true;
    async function load() {
      if (!supabase) {
        setMessage("Akun belum aktif karena konfigurasi Supabase belum tersedia.");
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/masuk?next=%2Fakun";
        return;
      }
      if (!active) return;

      setEmail(user.email || "");
      setName(user.user_metadata?.full_name || "Pengguna");

      const [profileResult, historyResult, activityResult] = await Promise.all([
        supabase.from("profiles")
          .select("full_name,show_on_leaderboard,daily_goal_questions")
          .eq("id", user.id)
          .maybeSingle(),
        supabase.from("exam_attempts")
          .select("id,title,category,total_questions,correct_answers,score,duration_seconds,completed_at")
          .order("completed_at", { ascending: false })
          .limit(10),
        supabase.from("user_study_activity")
          .select("activity_date,questions_answered,sessions_completed")
          .order("activity_date", { ascending: false })
          .limit(400),
      ]);

      if (!active) return;
      if (profileResult.data) {
        setName(profileResult.data.full_name || user.user_metadata?.full_name || "Pengguna");
        setLeaderboard(Boolean(profileResult.data.show_on_leaderboard));
        setDailyGoal(profileResult.data.daily_goal_questions || 10);
      }
      if (historyResult.error) {
        setMessage("Riwayat latihan belum dapat dimuat. Silakan muat ulang halaman.");
      } else {
        setAttempts((historyResult.data || []) as Attempt[]);
        setMessage("");
      }
      if (!activityResult.error) {
        setStudyDays((activityResult.data || []) as StudyDay[]);
      }
    }
    void load();
    return () => { active = false; };
  }, [supabase]);

  async function saveProfile() {
    if (!supabase) return;
    const cleanName = name.trim();
    if (cleanName.length < 2 || cleanName.length > 80) {
      setMessage("Nama harus terdiri dari 2 sampai 80 karakter.");
      return;
    }
    if (!Number.isInteger(dailyGoal) || dailyGoal < 5 || dailyGoal > 100) {
      setMessage("Target harian harus berupa angka 5 sampai 100 soal.");
      return;
    }
    setMessage("Menyimpan profil...");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessage("Sesi akun berakhir. Silakan masuk kembali.");
      return;
    }
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: cleanName,
      show_on_leaderboard: leaderboard,
      daily_goal_questions: dailyGoal,
    });
    if (error) {
      setMessage("Profil gagal disimpan. Silakan coba kembali.");
    } else {
      setName(cleanName);
      setMessage("Profil dan target belajar berhasil disimpan.");
    }
  }

  async function logout() {
    await supabase?.auth.signOut();
    window.location.href = "/";
  }

  const total = attempts.length;
  const average = total
    ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.score, 0) / total)
    : 0;
  const categoryStats = ["TWK", "TIU", "TKP"].map((category) => {
    const rows = attempts.filter((attempt) => (attempt.category || "").toUpperCase() === category);
    const questions = rows.reduce((sum, attempt) => sum + attempt.total_questions, 0);
    const best = rows.reduce((sum, attempt) => sum + attempt.correct_answers, 0);
    return { category, questions, accuracy: questions ? best / questions : 1 };
  }).filter((item) => item.questions > 0);
  const weakest = categoryStats.sort((a, b) => a.accuracy - b.accuracy)[0];
  const focus = weakest
    ? {
        title: `Perkuat ${weakest.category}`,
        detail: `Dalam riwayat 10 sesi terakhir, ${weakest.category} memiliki ${Math.round(weakest.accuracy * 100)}% jawaban terbaik/benar. Coba latihan terarah untuk meningkatkan hasil.`,
      }
    : {
        title: "Mulai dari latihan singkat",
        detail: "Kerjakan satu sesi latihan TWK, TIU, atau TKP. Setelah ada hasil, Sukses CPNS akan membantu menunjukkan bagian yang perlu kamu tingkatkan.",
      };

  const todayKey = jakartaDateKey();
  const activityByDate = new Map(studyDays.map((day) => [day.activity_date, day]));
  const todayActivity = activityByDate.get(todayKey);
  const todayQuestions = todayActivity?.questions_answered || 0;
  const goalPercent = Math.min(100, Math.round((todayQuestions / dailyGoal) * 100));
  let streak = 0;
  let streakCursor = todayActivity ? todayKey : previousDateKey(todayKey);
  while (activityByDate.has(streakCursor)) {
    streak += 1;
    streakCursor = previousDateKey(streakCursor);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600">
            <ArrowLeft size={17} /> Beranda
          </Link>
          <button onClick={logout} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500">
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-blue-600">Dashboard peserta</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">Halo, {name}</h1>
            <p className="mt-1 text-sm text-slate-500">{email}</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-800">
            Paket Reguler · Gratis
          </span>
        </div>

        <section className="mt-8 rounded-2xl border bg-white p-5">
          <h2 className="font-extrabold">Profil dan target belajar</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input
              aria-label="Nama lengkap"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-xl border px-4 py-3"
              placeholder="Nama lengkap"
            />
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={leaderboard}
                onChange={(event) => setLeaderboard(event.target.checked)}
              />
              Tampilkan nama di peringkat publik
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Target soal per hari
              <select
                value={dailyGoal}
                onChange={(event) => setDailyGoal(Number(event.target.value))}
                className="mt-2 block w-full rounded-xl border bg-white px-4 py-3"
              >
                {[5, 10, 15, 20, 25, 30, 40, 50, 75, 100].map((value) => (
                  <option key={value} value={value}>{value} soal per hari</option>
                ))}
              </select>
            </label>
            <button
              onClick={() => void saveProfile()}
              className="self-end rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white"
            >
              Simpan pengaturan
            </button>
          </div>
          {message && (
            <p role="status" aria-live="polite" className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {message}
            </p>
          )}
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <article className="rounded-3xl border border-orange-100 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500">Streak belajar</p>
                <p className="mt-2 text-4xl font-black text-slate-950">{streak} hari</p>
              </div>
              <div className="rounded-2xl bg-orange-50 p-4 text-orange-600"><Flame size={30} /></div>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              {streak > 0 ? "Pertahankan konsistensi belajarmu setiap hari." : "Selesaikan latihan hari ini untuk memulai streak."}
            </p>
          </article>
          <article className="rounded-3xl border border-emerald-100 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500">Target hari ini</p>
                <p className="mt-2 text-4xl font-black text-slate-950">{todayQuestions}/{dailyGoal}</p>
                <p className="mt-1 text-xs text-slate-500">soal dikerjakan · waktu Jakarta</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-700"><Target size={30} /></div>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${goalPercent}%` }} />
            </div>
            <p className="mt-2 text-sm font-semibold text-emerald-800">
              {goalPercent >= 100 ? "Target harian tercapai! Hebat." : `${goalPercent}% tercapai — lanjutkan sedikit demi sedikit.`}
            </p>
          </article>
        </section>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border bg-white p-5">
            <BookOpen className="text-blue-600" />
            <p className="mt-4 text-sm text-slate-500">Sesi latihan terakhir</p>
            <p className="mt-1 text-3xl font-black">{total}</p>
          </div>
          <div className="rounded-2xl border bg-white p-5">
            <Trophy className="text-amber-500" />
            <p className="mt-4 text-sm text-slate-500">Rata-rata skor latihan</p>
            <p className="mt-1 text-3xl font-black">{average}</p>
          </div>
          <div className="rounded-2xl border bg-white p-5">
            <Target className="text-emerald-600" />
            <p className="mt-4 text-sm text-slate-500">Total soal dalam riwayat</p>
            <p className="mt-1 text-3xl font-black">
              {attempts.reduce((sum, attempt) => sum + attempt.total_questions, 0)}
            </p>
          </div>
        </div>

        <section className="mt-8 rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
          <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-700">Rekomendasi belajar</p>
          <h2 className="mt-2 text-xl font-black text-emerald-950">{focus.title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-900">{focus.detail}</p>
          <Link href="/latihan" className="mt-4 inline-flex rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white">
            Mulai latihan <Target size={16} className="ml-2" />
          </Link>
        </section>

        <section className="mt-8 rounded-3xl border bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black">Riwayat latihan</h2>
            <Link href="/latihan" className="text-sm font-bold text-blue-700">Mulai latihan</Link>
          </div>
          {!message && attempts.length === 0 && (
            <p className="mt-5 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
              Belum ada riwayat. Selesaikan sesi latihan pertamamu untuk melihat progres di sini.
            </p>
          )}
          <div className="mt-4 space-y-3">
            {attempts.map((attempt) => (
              <article key={attempt.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4">
                <div>
                  <p className="font-bold text-slate-900">{attempt.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(attempt.completed_at).toLocaleString("id-ID")} · {attempt.correct_answers}/{attempt.total_questions} benar
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-blue-700">{attempt.score}</p>
                  <p className="text-xs text-slate-500">skor latihan</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link href="/materi" className="rounded-2xl border bg-white p-5 hover:border-blue-300">
            <BookOpen className="text-blue-600" />
            <h3 className="mt-3 font-extrabold">Materi belajar</h3>
            <p className="mt-1 text-sm text-slate-500">Pelajari ringkasan TWK, TIU, TKP, dan strategi.</p>
          </Link>
          <Link href="/paket" className="rounded-2xl border bg-white p-5 hover:border-blue-300">
            <BookOpen className="text-blue-600" />
            <h3 className="mt-3 font-extrabold">Paket Reguler</h3>
            <p className="mt-1 text-sm text-slate-500">Lihat fasilitas belajar gratis di website.</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
