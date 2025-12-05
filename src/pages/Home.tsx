import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import GlassCard from '@/components/GlassCard';
import { Flame, Sparkles, Clock, Trophy, Play, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { useChallenges, Challenge } from '@/hooks/useChallenges';

const categoryColors: Record<string, string> = {
  music: 'bg-primary/10 text-primary border-primary/20',
  art: 'bg-secondary/10 text-secondary border-secondary/20',
  writing: 'bg-accent/10 text-accent border-accent/20',
  dance: 'bg-primary/10 text-primary border-primary/20',
  coding: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
  photography: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  fitness: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  cooking: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
  gaming: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
  design: 'bg-secondary/10 text-secondary border-secondary/20',
};

const motivationalQuotes = [
  "Small daily improvements lead to stunning results.",
  "Your hobby today is your legacy tomorrow.",
  "Consistency beats intensity. Show up every day.",
  "Every expert was once a beginner.",
  "The secret to getting ahead is getting started.",
  "Passion + Persistence = Progress.",
  "Your creative spark can light up the world.",
  "One challenge at a time, one day at a time.",
];

export default function Home() {
  const user = useStore((state) => state.user);
  const { user: authUser } = useAuth();
  const startChallenge = useStore((state) => state.startChallenge);
  const navigate = useNavigate();
  const { dailyChallenges, loading } = useChallenges();
  const [showAllChallenges, setShowAllChallenges] = useState(false);
  const [profileData, setProfileData] = useState({
    currentStreak: 0,
    totalSessions: 0,
    badgesCount: 0,
  });

  const randomQuote = useMemo(() => {
    return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  }, []);

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

  // Show first 4 challenges by default, 14 when expanded
  const visibleChallenges = useMemo(() => {
    if (showAllChallenges) {
      return dailyChallenges.slice(0, 14);
    }
    return dailyChallenges.slice(0, 4);
  }, [dailyChallenges, showAllChallenges]);

  const handleStartChallenge = (challenge: Challenge) => {
    startChallenge({
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      category: challenge.category as 'music' | 'art' | 'writing' | 'dance' | 'coding' | 'photography' | 'fitness' | 'cooking' | 'gaming' | 'design',
      duration: challenge.duration,
      difficulty: challenge.difficulty,
      points: challenge.points,
    });
    navigate('/challenge');
  };

  const toggleViewAll = () => {
    setShowAllChallenges(!showAllChallenges);
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

        {/* Motivational Quote Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10" />
            <div className="relative py-8 px-6 text-center">
              <Sparkles className="w-8 h-8 mx-auto mb-4 text-primary animate-pulse" />
              <blockquote className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-foreground leading-tight">
                "{randomQuote}"
              </blockquote>
              <p className="mt-4 text-sm text-muted-foreground">Daily Motivation</p>
            </div>
          </GlassCard>
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
                Handpicked for your creative journey • <span className="text-primary font-medium">{dailyChallenges.length} {dailyChallenges.length === 1 ? 'challenge' : 'challenges'} left</span>
              </p>
            </div>
            {dailyChallenges.length > 4 && (
              <Button 
                variant="outline" 
                className="glass"
                onClick={toggleViewAll}
              >
                {showAllChallenges ? (
                  <>
                    Show Less
                    <ChevronUp className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    View All ({dailyChallenges.length - 4} more)
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <GlassCard key={i} className="h-48 animate-pulse">
                  <div className="h-full bg-muted/20 rounded-lg" />
                </GlassCard>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {visibleChallenges.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-2"
                  >
                    <GlassCard className="text-center py-12">
                      <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-display font-semibold mb-2">
                        No challenges match your hobbies yet
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Update your hobbies in profile settings to see personalized challenges
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/challenges')}
                      >
                        Browse All Challenges
                      </Button>
                    </GlassCard>
                  </motion.div>
                ) : (
                  visibleChallenges.map((challenge, index) => (
                    <motion.div
                      key={challenge.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      layout
                    >
                      <GlassCard hover className="h-full">
                        <div className="flex flex-col h-full">
                          <div className="flex items-start justify-between mb-4">
                            <Badge className={categoryColors[challenge.category] || 'bg-muted text-muted-foreground'}>
                              {challenge.category}
                            </Badge>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="glass">
                                <Clock className="w-3 h-3 mr-1" />
                                {challenge.duration} min
                              </Badge>
                              <Badge variant="outline" className="glass text-xs">
                                {challenge.points} pts
                              </Badge>
                            </div>
                          </div>
                          
                          <h3 className="text-xl font-display font-semibold mb-2">
                            {challenge.title}
                          </h3>
                          <p className="text-muted-foreground mb-4 flex-grow line-clamp-2">
                            {challenge.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-xs capitalize">
                              {challenge.difficulty}
                            </Badge>
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
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}