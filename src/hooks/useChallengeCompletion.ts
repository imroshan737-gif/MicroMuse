import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

export function useChallengeCompletion() {
  const { user } = useAuth();

  const completeChallenge = async (challengeId: string, points: number, isPersonal: boolean = false) => {
    if (!user) return;

    try {
      // For personal challenges, we need to create the challenge in the database first
      let dbChallengeId = challengeId;
      
      if (isPersonal || !isValidUUID(challengeId)) {
        // Create a personal challenge record in the challenges table
        const { data: newChallenge, error: createError } = await supabase
          .from('challenges')
          .insert({
            title: 'Personal Challenge',
            description: 'User created personal challenge',
            category: 'music',
            difficulty: 'beginner',
            type: 'personal',
            points: points,
            is_active: false, // Personal challenges shouldn't show in main lists
          })
          .select('id')
          .single();

        if (createError) throw createError;
        dbChallengeId = newChallenge.id;
      }

      // Insert challenge completion record
      const { error: challengeError } = await supabase
        .from('user_challenges')
        .insert({
          user_id: user.id,
          challenge_id: dbChallengeId,
          is_completed: true,
          completed_at: new Date().toISOString(),
          score: points,
        });

      if (challengeError) throw challengeError;

      // Update user profile stats including total_sessions
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_points, current_streak, longest_streak, total_sessions')
        .eq('id', user.id)
        .single();

      if (profile) {
        // Check if user already completed a challenge today for streak calculation
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        const { data: lastActivity } = await supabase
          .from('user_activity')
          .select('activity_date')
          .eq('user_id', user.id)
          .order('activity_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        let newStreak = profile.current_streak || 0;
        
        // Calculate streak
        if (!lastActivity) {
          // First activity ever
          newStreak = 1;
        } else if (lastActivity.activity_date === today) {
          // Already active today, keep streak
          newStreak = profile.current_streak || 1;
        } else if (lastActivity.activity_date === yesterday) {
          // Consecutive day, increment streak
          newStreak = (profile.current_streak || 0) + 1;
        } else {
          // Streak broken, reset to 1
          newStreak = 1;
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            total_points: (profile.total_points || 0) + points,
            current_streak: newStreak,
            longest_streak: Math.max(profile.longest_streak || 0, newStreak),
            total_sessions: (profile.total_sessions || 0) + 1,
          })
          .eq('id', user.id);

        if (profileError) throw profileError;
      }

      // Record daily activity
      const today = new Date().toISOString().split('T')[0];
      const { data: activity } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', user.id)
        .eq('activity_date', today)
        .maybeSingle();

      if (activity) {
        await supabase
          .from('user_activity')
          .update({
            sessions_count: (activity.sessions_count || 0) + 1,
            points_earned: (activity.points_earned || 0) + points,
          })
          .eq('id', activity.id);
      } else {
        await supabase
          .from('user_activity')
          .insert({
            user_id: user.id,
            activity_date: today,
            sessions_count: 1,
            points_earned: points,
          });
      }

      // Check and award achievements
      await checkAndAwardAchievements(user.id);

      toast({
        title: 'Challenge Completed! 🎉',
        description: `You earned ${points} points!`,
      });

      return true;
    } catch (error) {
      console.error('Error completing challenge:', error);
      toast({
        title: 'Error',
        description: 'Failed to save challenge completion',
        variant: 'destructive',
      });
      return false;
    }
  };

  const checkAndAwardAchievements = async (userId: string) => {
    try {
      // Get user stats
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_sessions, current_streak, total_points')
        .eq('id', userId)
        .single();

      if (!profile) return;

      // Get all achievements
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*');

      if (!achievements) return;

      // Get user's already earned achievements
      const { data: earnedAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId);

      const earnedIds = new Set(earnedAchievements?.map(a => a.achievement_id) || []);

      // Check each achievement
      for (const achievement of achievements) {
        if (earnedIds.has(achievement.id)) continue;

        let earned = false;

        switch (achievement.requirement_type) {
          case 'sessions':
            earned = (profile.total_sessions || 0) >= achievement.requirement_value;
            break;
          case 'streak':
            earned = (profile.current_streak || 0) >= achievement.requirement_value;
            break;
          case 'points':
            earned = (profile.total_points || 0) >= achievement.requirement_value;
            break;
        }

        if (earned) {
          await supabase
            .from('user_achievements')
            .insert({
              user_id: userId,
              achievement_id: achievement.id,
            });

          toast({
            title: 'Achievement Unlocked! 🏆',
            description: achievement.name,
          });
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  const getCompletedChallenges = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('user_challenges')
        .select('challenge_id')
        .eq('user_id', user.id)
        .eq('is_completed', true);

      if (error) throw error;
      return data.map(d => d.challenge_id);
    } catch (error) {
      console.error('Error fetching completed challenges:', error);
      return [];
    }
  };

  return { completeChallenge, getCompletedChallenges };
}

function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}
