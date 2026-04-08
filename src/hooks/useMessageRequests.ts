import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface MessageRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  sender?: {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
  receiver?: {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
}

export function useMessageRequests() {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<MessageRequest[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Get pending requests received by this user
    const { data: requests } = await supabase
      .from('message_requests')
      .select('*')
      .eq('receiver_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (!requests || requests.length === 0) {
      setPendingRequests([]);
      setPendingCount(0);
      setLoading(false);
      return;
    }

    const senderIds = requests.map(r => r.sender_id);
    const { data: profiles } = await supabase
      .from('public_profiles')
      .select('id, full_name, username, avatar_url')
      .in('id', senderIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    const enriched = requests.map(r => ({
      ...r,
      status: r.status as 'pending' | 'accepted' | 'declined',
      sender: profileMap.get(r.sender_id) as MessageRequest['sender'],
    }));

    setPendingRequests(enriched);
    setPendingCount(enriched.length);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Listen for new requests in real-time
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('message-requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'message_requests', filter: `receiver_id=eq.${user.id}` }, () => {
        fetchRequests();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchRequests]);

  const sendRequest = async (receiverId: string) => {
    if (!user) return { error: 'Not authenticated' };

    // Check if already sent
    const { data: existing } = await supabase
      .from('message_requests')
      .select('id, status')
      .eq('sender_id', user.id)
      .eq('receiver_id', receiverId)
      .maybeSingle();

    if (existing) {
      if (existing.status === 'accepted') return { error: null, alreadyAccepted: true };
      if (existing.status === 'pending') return { error: 'Request already sent' };
      // If declined, allow resending
      await supabase.from('message_requests').delete().eq('id', existing.id);
    }

    const { error } = await supabase.from('message_requests').insert({
      sender_id: user.id,
      receiver_id: receiverId,
    });

    return { error: error?.message || null };
  };

  const acceptRequest = async (requestId: string, senderId: string) => {
    if (!user) return null;

    await supabase.from('message_requests')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', requestId);

    // Create conversation
    const [u1, u2] = [user.id, senderId].sort();
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(user1_id.eq.${u1},user2_id.eq.${u2}),and(user1_id.eq.${u2},user2_id.eq.${u1})`)
      .maybeSingle();

    if (existing) return existing.id;

    const { data: newConvo } = await supabase
      .from('conversations')
      .insert({ user1_id: u1, user2_id: u2 })
      .select('id')
      .single();

    fetchRequests();
    return newConvo?.id || null;
  };

  const declineRequest = async (requestId: string) => {
    await supabase.from('message_requests')
      .update({ status: 'declined', updated_at: new Date().toISOString() })
      .eq('id', requestId);
    fetchRequests();
  };

  const checkRequestStatus = async (otherUserId: string): Promise<'none' | 'pending' | 'accepted' | 'declined'> => {
    if (!user) return 'none';

    const { data } = await supabase
      .from('message_requests')
      .select('status')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
      .eq('status', 'accepted')
      .maybeSingle();

    if (data) return 'accepted';

    const { data: pending } = await supabase
      .from('message_requests')
      .select('status')
      .eq('sender_id', user.id)
      .eq('receiver_id', otherUserId)
      .eq('status', 'pending')
      .maybeSingle();

    if (pending) return 'pending';

    return 'none';
  };

  return { pendingRequests, pendingCount, loading, sendRequest, acceptRequest, declineRequest, checkRequestStatus, refetch: fetchRequests };
}
