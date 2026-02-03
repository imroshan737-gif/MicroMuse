-- Allow authenticated users to create personal challenges (inactive, personal type)
CREATE POLICY "Users can create personal challenges"
ON public.challenges
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND type = 'personal' 
  AND is_active = false
);

-- Allow users to view their own personal challenges (even if inactive)
CREATE POLICY "Users can view own personal challenges via user_challenges"
ON public.challenges
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_challenges uc 
    WHERE uc.challenge_id = id 
    AND uc.user_id = auth.uid()
  )
);