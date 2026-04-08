
-- Message requests table for approval flow
CREATE TABLE public.message_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(sender_id, receiver_id)
);

ALTER TABLE public.message_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own message requests (sent or received)
CREATE POLICY "Users can view own message requests"
  ON public.message_requests FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can send message requests to people they follow
CREATE POLICY "Users can send message requests"
  ON public.message_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Users can update requests they received (accept/decline)
CREATE POLICY "Users can update received requests"
  ON public.message_requests FOR UPDATE TO authenticated
  USING (auth.uid() = receiver_id);

-- Users can delete their own sent requests
CREATE POLICY "Users can delete own requests"
  ON public.message_requests FOR DELETE TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Add UPDATE policy on conversations table
CREATE POLICY "Users can update own conversations"
  ON public.conversations FOR UPDATE TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);
