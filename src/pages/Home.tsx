import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import GlassCard from '@/components/GlassCard';
import { Flame, Sparkles, Clock, Trophy, Play, Star } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUserHobbies } from '@/hooks/useUserHobbies';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

const mockChallenges = [
  {
    id: '1',
    title: 'Morning Melody',
    description: 'Create a 30-second uplifting tune to start your day',
    category: 'music' as const,
    duration: 10 as const,
    difficulty: 'beginner' as const,
    participants: 234,
  },
  {
    id: '2',
    title: 'Emotion in Color',
    description: 'Express a feeling using only three colors',
    category: 'art' as const,
    duration: 10 as const,
    difficulty: 'intermediate' as const,
    participants: 189,
  },
  {
    id: '3',
    title: 'Micro Story',
    description: 'Tell a complete story in exactly 100 words',
    category: 'writing' as const,
    duration: 15 as const,
    difficulty: 'intermediate' as const,
    participants: 312,
  },
  {
    id: '4',
    title: 'Flow Movement',
    description: 'Choreograph 15 seconds of continuous motion',
    category: 'dance' as const,
    duration: 10 as const,
    difficulty: 'beginner' as const,
    participants: 156,
  },
];

const categoryColors = {
  music: 'bg-primary/10 text-primary border-primary/20',
  art: 'bg-secondary/10 text-secondary border-secondary/20',
  writing: 'bg-accent/10 text-accent border-accent/20',
  dance: 'bg-primary/10 text-primary border-primary/20',
};

export default function Home() {
  const user = useStore((state) => state.user);
  const { user: authUser } = useAuth();
  const startChallenge = useStore((state) => state.startChallenge);
  const navigate = useNavigate();
  const { hobbies } = useUserHobbies();
  const [profileData, setProfileData] = useState({
    currentStreak: 0,
    totalSessions: 0,
    badgesCount: 0,
  });

  useEffect(() => {
    async function fetchProfileData() {
      if (!authUser) return;

      const { data } = await supabase
        .from('profiles')
        .select('current_streak, total_sessions')
        .eq('id', authUser.id)
        .single();

      const { data: achievements } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', authUser.id);

      setProfileData({
        currentStreak: data?.current_streak || 0,
        totalSessions: data?.total_sessions || 0,
        badgesCount: achievements?.length || 0,
      });
    }

    fetchProfileData();
  }, [authUser]);

  const userHobbyCategories = useMemo(() => {
    return new Set(hobbies.map(h => h.category.toLowerCase()));
  }, [hobbies]);

  const filteredChallenges = useMemo(() => {
    if (userHobbyCategories.size === 0) return mockChallenges;
    return mockChallenges.filter(c => userHobbyCategories.has(c.category));
  }, [userHobbyCategories]);
  
  const handleStartChallenge = (challenge: typeof mockChallenges[0]) => {
    startChallenge(challenge);
    navigate('/challenge');
  };
  
  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-6xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-2">
            Welcome back, {user?.name || 'Creative'}! 👋
          </h1>
          <p className="text-lg text-muted-foreground">
            Your daily dose of inspiration awaits
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassCard className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Flame className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Streak</p>
              <p className="text-2xl font-bold">{profileData.currentStreak} days</p>
            </div>
          </GlassCard>
          
          <GlassCard className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-secondary flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
              <p className="text-2xl font-bold">{profileData.totalSessions}</p>
            </div>
          </GlassCard>
          
          <GlassCard className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Star className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Badges Earned</p>
              <p className="text-2xl font-bold">{profileData.badgesCount}</p>
            </div>
          </GlassCard>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-display font-bold mb-1">
                Today's Challenges
              </h2>
              <p className="text-muted-foreground">
                Handpicked for your creative journey
              </p>
            </div>
            <Button variant="outline" className="glass">
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredChallenges.length === 0 ? (
              <GlassCard className="col-span-2 text-center py-12">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-display font-semibold mb-2">
                  No challenges match your hobbies yet
                </h3>
                <p className="text-muted-foreground">
                  Update your hobbies in profile settings to see personalized challenges
                </p>
              </GlassCard>
            ) : (
              filteredChallenges.map((challenge, index) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard hover className="h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className={categoryColors[challenge.category]}>
                        {challenge.category}
                      </Badge>
                      <Badge variant="outline" className="glass">
                        <Clock className="w-3 h-3 mr-1" />
                        {challenge.duration} min
                      </Badge>
                    </div>
                    
                    <h3 className="text-xl font-display font-semibold mb-2">
                      {challenge.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 flex-grow">
                      {challenge.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Sparkles className="w-4 h-4" />
                        <span>{challenge.participants} joined today</span>
                      </div>
                      <Button
                        onClick={() => handleStartChallenge(challenge)}
                        className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
