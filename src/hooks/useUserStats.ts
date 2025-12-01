import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserStats {
  highestScore: number;
  longestStreak: number;
  bestDay: number;
  totalPoints: number;
}

export function useUserStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    highestScore: 0,
    longestStreak: 0,
    bestDay: 0,
    totalPoints: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch profile data for streaks and points
        const { data: profile } = await supabase
          .from('profiles')
          .select('longest_streak, total_points')
          .eq('id', user.id)
          .single();

        // Fetch best day from user_activity
        const { data: activities } = await supabase
          .from('user_activity')
          .select('sessions_count')
          .eq('user_id', user.id)
          .order('sessions_count', { ascending: false })
          .limit(1);

        // Fetch highest score from user_challenges
        const { data: challenges } = await supabase
          .from('user_challenges')
          .select('score')
          .eq('user_id', user.id)
          .order('score', { ascending: false })
          .limit(1);

        setStats({
          highestScore: challenges?.[0]?.score || 0,
          longestStreak: profile?.longest_streak || 0,
          bestDay: activities?.[0]?.sessions_count || 0,
          totalPoints: profile?.total_points || 0,
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [user]);

  return { stats, loading };
}
