import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  total?: number;
  category: string;
}

export function useUserAchievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAchievements() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch all achievements
        const { data: allAchievements } = await supabase
          .from('achievements')
          .select('*');

        // Fetch user's earned achievements
        const { data: userAchievements } = await supabase
          .from('user_achievements')
          .select('achievement_id, earned_at')
          .eq('user_id', user.id);

        const earnedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);
        const earnedDates = new Map(
          userAchievements?.map(ua => [ua.achievement_id, ua.earned_at]) || []
        );

        // Map achievements with earned status
        const mappedAchievements = (allAchievements || []).map(achievement => ({
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          earned: earnedIds.has(achievement.id),
          earnedDate: earnedDates.get(achievement.id),
          category: achievement.requirement_type,
          progress: 0,
          total: achievement.requirement_value,
        }));

        setAchievements(mappedAchievements);
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAchievements();
  }, [user]);

  return { achievements, loading };
}
