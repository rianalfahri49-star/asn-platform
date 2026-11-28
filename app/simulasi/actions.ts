"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export type RawExamAnswer = {
  question_id: string;
  answer: string | null;
  is_marked: boolean;
};

export type ExamSubmissionResult =
  | { success: true; result: { attempt_id: string; total_questions: number; correct_answers: number; score: number } }
  | { success: false; error: string };

export async function submitExamAction(
  answers: RawExamAnswer[],
  durationSeconds: number,
  title = "Simulasi CAT SKD",
  category = "SKD"
): Promise<ExamSubmissionResult> {
  try {
    if (!Array.isArray(answers) || answers.length < 1 || answers.length > 110) {
      return { success: false, error: "Daftar jawaban tidak valid." };
    }

    const valid = answers.every((item) =>
      item &&
      typeof item.question_id === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(item.question_id) &&
      (item.answer === null || ["A", "B", "C", "D", "E"].includes(item.answer)) &&
      typeof item.is_marked === "boolean"
    );
    if (!valid || new Set(answers.map((item) => item.question_id)).size !== answers.length) {
      return { success: false, error: "Format jawaban tidak valid." };
    }

    if (typeof title !== "string" || !title.trim() || title.length > 120 ||
        !["SKD", "TWK", "TIU", "TKP"].includes(category)) {
      return { success: false, error: "Informasi sesi ujian tidak valid." };
    }

    const duration = Number.isInteger(durationSeconds)
      ? Math.min(6600, Math.max(0, durationSeconds))
      : null;
    if (duration === null) {
      return { success: false, error: "Durasi ujian tidak valid." };
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      return { success: false, error: "Konfigurasi database belum tersedia." };
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Cookie writes can be unavailable in a Server Component context.
          }
        },
      },
    });

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return { success: false, error: "Silakan masuk untuk menyimpan hasil ujian." };
    }

    const { data, error } = await supabase.rpc("submit_exam_attempt", {
      p_title: title.trim(),
      p_category: category,
      p_answers: answers,
      p_duration_seconds: duration,
    });

    if (error) {
      console.error("submit_exam_attempt failed:", error.message);
      return { success: false, error: "Hasil ujian gagal disimpan. Silakan coba lagi." };
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
      return { success: false, error: "Server tidak mengembalikan hasil ujian." };
    }

    return {
      success: true,
      result: {
        attempt_id: row.attempt_id,
        total_questions: row.total_questions,
        correct_answers: row.correct_answers,
        score: row.score,
      },
    };
  } catch (error) {
    console.error("submitExamAction unexpected error:", error);
    return { success: false, error: "Terjadi kesalahan saat mengumpulkan ujian." };
  }
}


export type ExamReviewItem = {
  question_id: string;
  category: string;
  topic: string;
  question: string;
  options: string[];
  selected_answer: string | null;
  correct_answer: string;
  explanation: string;
};

export type ExamReviewResult =
  | { success: true; items: ExamReviewItem[] }
  | { success: false; error: string };

export async function getExamReviewAction(attemptId: string): Promise<ExamReviewResult> {
  try {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(attemptId)) {
      return { success: false, error: "ID hasil ujian tidak valid." };
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return { success: false, error: "Konfigurasi database belum tersedia." };

    const cookieStore = await cookies();
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Cookie writes can be unavailable in a Server Component context.
          }
        },
      },
    });

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) return { success: false, error: "Silakan masuk untuk melihat pembahasan." };

    const { data, error } = await supabase.rpc("get_exam_review", { p_attempt_id: attemptId });
    if (error) {
      console.error("get_exam_review failed:", error.message);
      return { success: false, error: "Pembahasan belum dapat dimuat." };
    }

    return { success: true, items: (data || []) as ExamReviewItem[] };
  } catch (error) {
    console.error("getExamReviewAction unexpected error:", error);
    return { success: false, error: "Terjadi kesalahan saat memuat pembahasan." };
  }
}
