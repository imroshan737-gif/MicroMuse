import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserHobbies } from './useUserHobbies';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  difficulty: 'beginner' | 'moderate' | 'expert';
  points: number;
  type: 'daily' | 'weekly' | 'personal';
  isCompleted?: boolean;
}

export function useChallenges() {
  const { user } = useAuth();
  const { hobbies } = useUserHobbies();
  const [dailyChallenges, setDailyChallenges] = useState<Challenge[]>([]);
  const [weeklyChallenges, setWeeklyChallenges] = useState<Challenge[]>([]);
  const [personalChallenges, setPersonalChallenges] = useState<Challenge[]>([]);
  const [completedChallengeIds, setCompletedChallengeIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchChallenges = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch all active challenges from database
      const { data: dbChallenges, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      // Fetch user's completed challenges
      const { data: completed } = await supabase
        .from('user_challenges')
        .select('challenge_id')
        .eq('user_id', user.id)
        .eq('is_completed', true);

      const completedIds = completed?.map(c => c.challenge_id) || [];
      setCompletedChallengeIds(completedIds);

      // Get user's hobby categories - STRICT FILTERING
      // Map hobby categories to challenge categories (lowercase)
      const userCategories = new Set(
        hobbies.map(h => h.category.toLowerCase())
      );

      // Transform challenges
      const transformedChallenges: Challenge[] = (dbChallenges || []).map(c => ({
        id: c.id,
        title: c.title,
        description: c.description,
        category: c.category,
        duration: c.duration_minutes || 10,
        difficulty: c.difficulty as 'beginner' | 'moderate' | 'expert',
        points: c.points || 10,
        type: c.type as 'daily' | 'weekly' | 'personal',
        isCompleted: completedIds.includes(c.id),
      }));

      // STRICT FILTER: Only show challenges matching user's selected hobbies
      // If user has no hobbies, show NO challenges (they need to select hobbies first)
      const filterByHobbies = (challenges: Challenge[]) => {
        if (userCategories.size === 0) {
          // No hobbies selected = no challenges shown
          return [];
        }
        // Only include challenges where the category matches a user's hobby
        return challenges.filter(c => userCategories.has(c.category.toLowerCase()));
      };

      // Separate by type and filter out completed ones
      const daily = filterByHobbies(
        transformedChallenges.filter(c => c.type === 'daily' && !c.isCompleted)
      );
      const weekly = filterByHobbies(
        transformedChallenges.filter(c => c.type === 'weekly' && !c.isCompleted)
      );

      setDailyChallenges(daily);
      setWeeklyChallenges(weekly);

      // Fetch user's personal challenges (inactive challenges created by this user)
      const { data: personalData } = await supabase
        .from('user_challenges')
        .select(`
          challenge_id,
          is_completed,
          challenges (*)
        `)
        .eq('user_id', user.id);

      // Filter personal challenges from completed list
      const personal = (personalData || [])
        .filter((p: any) => p.challenges?.type === 'personal' && !p.is_completed)
        .map((p: any) => ({
          id: p.challenges.id,
          title: p.challenges.title,
          description: p.challenges.description,
          category: p.challenges.category,
          duration: p.challenges.duration_minutes || 10,
          difficulty: p.challenges.difficulty as 'beginner' | 'moderate' | 'expert',
          points: p.challenges.points || 10,
          type: 'personal' as const,
          isCompleted: p.is_completed,
        }));

      setPersonalChallenges(personal);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [user, hobbies, refreshKey]);

  const refreshChallenges = () => {
    setLoading(true);
    setRefreshKey(prev => prev + 1);
  };

  const createPersonalChallenge = async (challenge: {
    title: string;
    description: string;
    category: string;
    duration: number;
  }) => {
    if (!user) return null;

    try {
      // Map 'others' to 'studies' since 'others' is not in the enum
      const categoryMap: Record<string, string> = { others: 'studies' };
      const dbCategory = categoryMap[challenge.category] || challenge.category;

      const challengeId = crypto.randomUUID();
      const points = challenge.duration * 5;

      // Create challenge in database (without .select() to avoid RLS SELECT conflict)
      const { error } = await supabase
        .from('challenges')
        .insert({
          id: challengeId,
          title: challenge.title,
          description: challenge.description,
          category: dbCategory as any,
          duration_minutes: challenge.duration,
          difficulty: 'beginner',
          type: 'personal',
          points,
          is_active: false,
        });

      if (error) throw error;

      // Create user_challenge record to link it to the user
      const { error: linkError } = await supabase
        .from('user_challenges')
        .insert({
          user_id: user.id,
          challenge_id: challengeId,
          is_completed: false,
        });

      if (linkError) throw linkError;

      const transformedChallenge: Challenge = {
        id: challengeId,
        title: challenge.title,
        description: challenge.description,
        category: challenge.category,
        duration: challenge.duration,
        difficulty: 'beginner',
        points,
        type: 'personal',
      };

      setPersonalChallenges(prev => [...prev, transformedChallenge]);
      return transformedChallenge;
    } catch (error) {
      console.error('Error creating personal challenge:', error);
      return null;
    }
  };

  return {
    dailyChallenges,
    weeklyChallenges,
    personalChallenges,
    completedChallengeIds,
    loading,
    createPersonalChallenge,
    refreshChallenges,
  };
}
