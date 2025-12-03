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

  useEffect(() => {
    async function fetchChallenges() {
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

        // Get user's hobby categories
        const userCategories = new Set(hobbies.map(h => h.category.toLowerCase()));

        // Transform and filter challenges
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

        // Filter by user hobbies (if they have hobbies selected)
        const filterByHobbies = (challenges: Challenge[]) => {
          if (userCategories.size === 0) return challenges;
          return challenges.filter(c => userCategories.has(c.category));
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
    }

    fetchChallenges();
  }, [user, hobbies]);

  const createPersonalChallenge = async (challenge: {
    title: string;
    description: string;
    category: string;
    duration: number;
  }) => {
    if (!user) return null;

    try {
      // Create challenge in database
      const { data: newChallenge, error } = await supabase
        .from('challenges')
        .insert({
          title: challenge.title,
          description: challenge.description,
          category: challenge.category as any,
          duration_minutes: challenge.duration,
          difficulty: 'beginner',
          type: 'personal',
          points: challenge.duration * 5,
          is_active: false, // Personal challenges are not shown in main lists
        })
        .select()
        .single();

      if (error) throw error;

      // Create user_challenge record to link it to the user
      await supabase
        .from('user_challenges')
        .insert({
          user_id: user.id,
          challenge_id: newChallenge.id,
          is_completed: false,
        });

      const transformedChallenge: Challenge = {
        id: newChallenge.id,
        title: newChallenge.title,
        description: newChallenge.description,
        category: newChallenge.category,
        duration: newChallenge.duration_minutes || 10,
        difficulty: newChallenge.difficulty as 'beginner' | 'moderate' | 'expert',
        points: newChallenge.points || 10,
        type: 'personal',
      };

      setPersonalChallenges(prev => [...prev, transformedChallenge]);
      return transformedChallenge;
    } catch (error) {
      console.error('Error creating personal challenge:', error);
      return null;
    }
  };

  const refreshChallenges = async () => {
    setLoading(true);
    // Re-fetch by triggering useEffect
    if (user) {
      const { data: completed } = await supabase
        .from('user_challenges')
        .select('challenge_id')
        .eq('user_id', user.id)
        .eq('is_completed', true);

      setCompletedChallengeIds(completed?.map(c => c.challenge_id) || []);
    }
    setLoading(false);
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
