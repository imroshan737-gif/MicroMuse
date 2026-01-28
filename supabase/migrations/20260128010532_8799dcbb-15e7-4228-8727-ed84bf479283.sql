-- Enable realtime for profiles table to power the leaderboard
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;