-- Fix the security definer view issue
-- Recreate the public_profiles view to ensure it's not a security definer view

DROP VIEW IF EXISTS public.public_profiles;

-- Create view without security definer (uses invoker's permissions)
CREATE VIEW public.public_profiles 
WITH (security_invoker = true) AS
SELECT 
  id,
  full_name,
  username,
  avatar_url,
  bio,
  mood,
  location,
  current_streak,
  longest_streak,
  total_points,
  total_sessions,
  profile_completion,
  user_status,
  created_at,
  updated_at
FROM profiles
WHERE is_profile_public = true;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;