-- Streak system: server-side, timezone-aware, race-safe

-- 1. New columns on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_completed_date date;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS timezone text;
COMMENT ON COLUMN public.profiles.last_completed_date IS 'Calendar day (user timezone) of the user''s latest completed challenge; drives streak math';
COMMENT ON COLUMN public.profiles.timezone IS 'IANA timezone used for streak day boundaries';

-- Backfill: keep existing active streaks alive until their next missed day
UPDATE public.profiles
SET last_completed_date = (now() AT TIME ZONE COALESCE(timezone, 'UTC'))::date
WHERE current_streak > 0 AND last_completed_date IS NULL;

-- 2. One activity row per user per calendar day (guarantees single streak day, enables atomic upsert)
CREATE UNIQUE INDEX IF NOT EXISTS user_activity_user_date_uniq
  ON public.user_activity(user_id, activity_date);

-- 3. Streak guard: users may not write streak/points columns directly
CREATE OR REPLACE FUNCTION public.guard_profile_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() = NEW.id THEN
    IF (NEW.current_streak IS DISTINCT FROM OLD.current_streak)
       OR (NEW.longest_streak IS DISTINCT FROM OLD.longest_streak)
       OR (NEW.last_completed_date IS DISTINCT FROM OLD.last_completed_date)
       OR (NEW.total_points IS DISTINCT FROM OLD.total_points)
       OR (NEW.total_sessions IS DISTINCT FROM OLD.total_sessions)
    THEN
      IF COALESCE(current_setting('app.streak_bypass', true), '') <> 'on' THEN
        RAISE EXCEPTION 'Streak, points and session stats are maintained automatically and cannot be edited directly.';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS guard_profile_stats_trigger ON public.profiles;
CREATE TRIGGER guard_profile_stats_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_stats();

-- 4. Atomic completion: validates, locks the profile row, computes streak in the user's timezone,
--    records the completion once, upserts daily activity, awards achievements.
CREATE OR REPLACE FUNCTION public.complete_challenge_streak(
  p_challenge_id uuid,
  p_points integer,
  p_submission_url text DEFAULT NULL,
  p_timezone text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_user uuid;
  v_tz text;
  v_today date;
  v_last date;
  v_streak integer;
  v_longest integer;
  v_points integer;
  v_sessions integer;
  v_streak_increased boolean := false;
  v_new_achievements text[] := '{}';
BEGIN
  v_user := auth.uid();
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to record a challenge.';
  END IF;

  IF p_challenge_id IS NULL OR p_points IS NULL OR p_points < 0 OR p_points > 100000 THEN
    RAISE EXCEPTION 'Invalid challenge or points.';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.challenges WHERE id = p_challenge_id) THEN
    RAISE EXCEPTION 'Challenge not found.';
  END IF;

  -- Duplicate-request guard: the same challenge completed seconds ago is ignored
  IF EXISTS (
    SELECT 1 FROM public.user_challenges
    WHERE user_id = v_user
      AND challenge_id = p_challenge_id
      AND is_completed = true
      AND completed_at > now() - interval '30 seconds'
  ) THEN
    RAISE EXCEPTION 'DUPLICATE: This completion was already recorded moments ago.';
  END IF;

  -- Resolve timezone (validated; falls back to stored value, then UTC)
  v_tz := COALESCE(p_timezone, (SELECT timezone FROM public.profiles WHERE id = v_user), 'UTC');
  BEGIN
    PERFORM now() AT TIME ZONE v_tz;
  EXCEPTION WHEN OTHERS THEN
    v_tz := 'UTC';
  END;

  -- Bypass the stats guard for this transaction (server-side writes only)
  PERFORM set_config('app.streak_bypass', 'on', true);

  -- Row lock serializes concurrent completions per user
  SELECT COALESCE(current_streak, 0), COALESCE(longest_streak, 0),
         COALESCE(total_points, 0), COALESCE(total_sessions, 0), last_completed_date
    INTO v_streak, v_longest, v_points, v_sessions, v_last
  FROM public.profiles
  WHERE id = v_user
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found.';
  END IF;

  v_today := (now() AT TIME ZONE v_tz)::date;

  -- One streak day per calendar day: consecutive day +1, missed day(s) restart at 1,
  -- repeat submissions on the same day leave the streak unchanged.
  IF v_last IS NULL OR v_today > v_last THEN
    IF v_last = v_today - 1 THEN
      v_streak := v_streak + 1;
    ELSE
      v_streak := 1;
    END IF;
    v_longest := GREATEST(v_longest, v_streak);
    v_streak_increased := true;
  END IF;

  v_points := v_points + p_points;
  v_sessions := v_sessions + 1;

  UPDATE public.profiles
  SET total_points = v_points,
      total_sessions = v_sessions,
      current_streak = v_streak,
      longest_streak = v_longest,
      last_completed_date = v_today,
      timezone = v_tz
  WHERE id = v_user;

  INSERT INTO public.user_challenges (user_id, challenge_id, is_completed, completed_at, score, submission_url)
  VALUES (v_user, p_challenge_id, true, now(), p_points, p_submission_url);

  INSERT INTO public.user_activity (user_id, activity_date, sessions_count, points_earned)
  VALUES (v_user, v_today, 1, p_points)
  ON CONFLICT (user_id, activity_date) DO UPDATE
  SET sessions_count = public.user_activity.sessions_count + 1,
      points_earned = public.user_activity.points_earned + p_points;

  -- Award any newly earned achievements
  WITH ins AS (
    INSERT INTO public.user_achievements (user_id, achievement_id)
    SELECT v_user, a.id
    FROM public.achievements a
    JOIN LATERAL (
      SELECT CASE a.requirement_type
        WHEN 'sessions' THEN v_sessions
        WHEN 'streak' THEN v_streak
        WHEN 'points' THEN v_points
      END AS value
    ) req ON true
    WHERE req.value IS NOT NULL
      AND req.value >= a.requirement_value
      AND NOT EXISTS (
        SELECT 1 FROM public.user_achievements ua
        WHERE ua.user_id = v_user AND ua.achievement_id = a.id
      )
    RETURNING achievement_id
  )
  SELECT COALESCE(array_agg(a.name), '{}') INTO v_new_achievements
  FROM ins
  JOIN public.achievements a ON a.id = ins.achievement_id;

  RETURN jsonb_build_object(
    'current_streak', v_streak,
    'longest_streak', v_longest,
    'streak_increased', v_streak_increased,
    'points_awarded', p_points,
    'total_points', v_points,
    'new_achievements', to_jsonb(COALESCE(v_new_achievements, '{}'::text[]))
  );
END;
$function$;

-- 5. Dashboard validation: derives + persists a missed-day reset on load
CREATE OR REPLACE FUNCTION public.get_streak_state()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_user uuid;
  v_tz text;
  v_today date;
  v_last date;
  v_streak integer;
  v_sessions integer;
BEGIN
  v_user := auth.uid();
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'You must be signed in.';
  END IF;

  PERFORM set_config('app.streak_bypass', 'on', true);

  SELECT COALESCE(timezone, 'UTC'), COALESCE(current_streak, 0),
         last_completed_date, COALESCE(total_sessions, 0)
    INTO v_tz, v_streak, v_last, v_sessions
  FROM public.profiles
  WHERE id = v_user;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found.';
  END IF;

  v_today := (now() AT TIME ZONE v_tz)::date;

  IF v_streak > 0 AND (v_last IS NULL OR v_today > v_last + 1) THEN
    UPDATE public.profiles SET current_streak = 0 WHERE id = v_user;
    v_streak := 0;
  END IF;

  RETURN jsonb_build_object(
    'current_streak', v_streak,
    'longest_streak', (SELECT COALESCE(longest_streak, 0) FROM public.profiles WHERE id = v_user),
    'total_sessions', v_sessions,
    'last_completed_date', to_jsonb(v_last)
  );
END;
$function$;

-- 6. Execute permissions: signed-in users only
REVOKE EXECUTE ON FUNCTION public.complete_challenge_streak(uuid, integer, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_challenge_streak(uuid, integer, text, text) TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.get_streak_state() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_streak_state() TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.guard_profile_stats() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.guard_profile_stats() TO service_role;