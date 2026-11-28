-- Tighten student-facing access to question keys and exam submission RPC.
-- Students may read published question content, but never the answer key.
REVOKE SELECT (correct_answer) ON TABLE public.questions FROM anon;

-- Exam submissions must only be callable by signed-in users.
REVOKE EXECUTE ON FUNCTION public.submit_exam_attempt(text, text, jsonb, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_exam_attempt(text, text, jsonb, integer) TO authenticated;

-- The leaderboard is intentionally public, but only includes users who opted in.
REVOKE ALL ON FUNCTION public.get_leaderboard() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_leaderboard() TO anon, authenticated;
