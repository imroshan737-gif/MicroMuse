-- First, drop the existing problematic policies
DROP POLICY IF EXISTS "Users can create personal challenges" ON public.challenges;
DROP POLICY IF EXISTS "Users can view own personal challenges via user_challenges" ON public.challenges;

-- Create a PERMISSIVE INSERT policy for personal challenges
CREATE POLICY "Users can insert personal challenges"
ON public.challenges
FOR INSERT
TO authenticated
WITH CHECK (
  type = 'personal' 
  AND is_active = false
);

-- Create a PERMISSIVE SELECT policy for users to view their own personal challenges
-- Fixed: uc.challenge_id should match challenges.id, not uc.id
CREATE POLICY "Users can select own personal challenges"
ON public.challenges
FOR SELECT
TO authenticated
USING (
  type = 'personal' AND is_active = false AND EXISTS (
    SELECT 1 FROM public.user_challenges uc 
    WHERE uc.challenge_id = challenges.id 
    AND uc.user_id = auth.uid()
  )
);