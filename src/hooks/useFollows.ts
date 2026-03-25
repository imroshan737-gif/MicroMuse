import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useFollows(targetUserId?: string) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowedBy, setIsFollowedBy] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const checkFollowStatus = useCallback(async () => {
    if (!user || !targetUserId || user.id === targetUserId) return;

    const [{ data: following }, { data: followedBy }] = await Promise.all([
      supabase.from('follows').select('id').eq('follower_id', user.id).eq('following_id', targetUserId).maybeSingle(),
      supabase.from('follows').select('id').eq('follower_id', targetUserId).eq('following_id', user.id).maybeSingle(),
    ]);

    setIsFollowing(!!following);
    setIsFollowedBy(!!followedBy);
  }, [user, targetUserId]);

  const fetchCounts = useCallback(async () => {
    const uid = targetUserId || user?.id;
    if (!uid) return;

    const [{ count: followers }, { count: following }] = await Promise.all([
      supabase.from('follows').select('id', { count: 'exact', head: true }).eq('following_id', uid),
      supabase.from('follows').select('id', { count: 'exact', head: true }).eq('follower_id', uid),
    ]);

    setFollowersCount(followers || 0);
    setFollowingCount(following || 0);
  }, [user, targetUserId]);

  useEffect(() => {
    checkFollowStatus();
    fetchCounts();
  }, [checkFollowStatus, fetchCounts]);

  const follow = async () => {
    if (!user || !targetUserId) return;
    setLoading(true);
    await supabase.from('follows').insert({ follower_id: user.id, following_id: targetUserId });
    setIsFollowing(true);
    setFollowersCount(c => c + 1);
    setLoading(false);
  };

  const unfollow = async () => {
    if (!user || !targetUserId) return;
    setLoading(true);
    await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', targetUserId);
    setIsFollowing(false);
    setFollowersCount(c => c - 1);
    setLoading(false);
  };

  const isMutual = isFollowing && isFollowedBy;

  return { isFollowing, isFollowedBy, isMutual, followersCount, followingCount, follow, unfollow, loading, refetch: () => { checkFollowStatus(); fetchCounts(); } };
}
