import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Hobby {
  id: string;
  name: string;
  category: string;
  emoji?: string;
  icon?: string;
}

export function useUserHobbies() {
  const { user } = useAuth();
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHobbies() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await supabase
          .from('user_hobbies')
          .select(`
            hobby_id,
            hobbies (
              id,
              name,
              category,
              emoji,
              icon
            )
          `)
          .eq('user_id', user.id)
          .order('display_order');

        const mappedHobbies = (data || []).map((item: any) => ({
          id: item.hobbies.id,
          name: item.hobbies.name,
          category: item.hobbies.category,
          emoji: item.hobbies.emoji,
          icon: item.hobbies.icon,
        }));

        setHobbies(mappedHobbies);
      } catch (error) {
        console.error('Error fetching user hobbies:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchHobbies();
  }, [user]);

  return { hobbies, loading };
}
