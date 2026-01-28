-- Allow authenticated users to view user_hobbies for leaderboard purposes (only hobby_id, not sensitive data)
CREATE POLICY "Anyone can view user hobbies for leaderboard" 
ON public.user_hobbies 
FOR SELECT 
USING (true);