-- Persist per-user daily study activity and configurable daily question goals.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS daily_goal_questions integer NOT NULL DEFAULT 10
  CHECK (daily_goal_questions BETWEEN 5 AND 100);

CREATE TABLE IF NOT EXISTS public.user_study_activity (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_date date NOT NULL,
  questions_answered integer NOT NULL DEFAULT 0 CHECK (questions_answered >= 0),
  sessions_completed integer NOT NULL DEFAULT 0 CHECK (sessions_completed >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, activity_date)
);

ALTER TABLE public.user_study_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own study activity" ON public.user_study_activity;
CREATE POLICY "Users can read own study activity"
  ON public.user_study_activity FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

REVOKE ALL ON public.user_study_activity FROM anon, authenticated;
GRANT SELECT ON public.user_study_activity TO authenticated;

CREATE OR REPLACE FUNCTION public.record_exam_daily_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_activity_date date;
BEGIN
  v_activity_date := (NEW.completed_at AT TIME ZONE 'Asia/Jakarta')::date;
  INSERT INTO public.user_study_activity
    (user_id, activity_date, questions_answered, sessions_completed, updated_at)
  VALUES
    (NEW.user_id, v_activity_date, GREATEST(NEW.total_questions, 0), 1, now())
  ON CONFLICT (user_id, activity_date)
  DO UPDATE SET
    questions_answered = public.user_study_activity.questions_answered + EXCLUDED.questions_answered,
    sessions_completed = public.user_study_activity.sessions_completed + 1,
    updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.record_exam_daily_activity() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS trg_record_exam_daily_activity ON public.exam_attempts;
CREATE TRIGGER trg_record_exam_daily_activity
AFTER INSERT ON public.exam_attempts
FOR EACH ROW EXECUTE FUNCTION public.record_exam_daily_activity();

-- Backfill activity from all previously completed practice sessions.
INSERT INTO public.user_study_activity
  (user_id, activity_date, questions_answered, sessions_completed, updated_at)
SELECT
  user_id,
  (completed_at AT TIME ZONE 'Asia/Jakarta')::date,
  SUM(GREATEST(total_questions, 0))::integer,
  COUNT(*)::integer,
  now()
FROM public.exam_attempts
GROUP BY user_id, (completed_at AT TIME ZONE 'Asia/Jakarta')::date
ON CONFLICT (user_id, activity_date)
DO UPDATE SET
  questions_answered = EXCLUDED.questions_answered,
  sessions_completed = EXCLUDED.sessions_completed,
  updated_at = now();

CREATE INDEX IF NOT EXISTS idx_user_study_activity_user_date
  ON public.user_study_activity (user_id, activity_date DESC);
