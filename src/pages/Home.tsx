import { useMemo, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/GlassCard';
import { Sparkles, ChevronDown, ChevronUp, Rocket } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useChallenges, Challenge } from '@/hooks/useChallenges';

import TypewriterQuote from '@/components/home/TypewriterQuote';
import StatsSection from '@/components/home/StatsSection';
import ChallengeCard from '@/components/home/ChallengeCard';
import LandingFooter from '@/components/LandingFooter';

export default function Home() {
  const user = useStore((state) => state.user);
  const { user: authUser } = useAuth();
  const startChallenge = useStore((state) => state.startChallenge);
  const navigate = useNavigate();
  const { dailyChallenges, loading, refreshChallenges } = useChallenges();
  const [showAllChallenges, setShowAllChallenges] = useState(false);
  const [profileData, setProfileData] = useState({
    currentStreak: 0,
    totalSessions: 0,
    badgesCount: 0,
  });

  const fetchProfileData = useCallback(async () => {
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
  }, [authUser]);

  useEffect(() => {
    fetchProfileData();
    refreshChallenges();
  }, [authUser, fetchProfileData]);

  const visibleChallenges = useMemo(() => {
    return showAllChallenges ? dailyChallenges : dailyChallenges.slice(0, 4);
  }, [dailyChallenges, showAllChallenges]);

  const remainingChallengesCount = Math.max(0, dailyChallenges.length - 4);

  const handleStartChallenge = (challenge: Challenge) => {
    startChallenge({
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      category: challenge.category as any,
      duration: challenge.duration,
      difficulty: challenge.difficulty,
      points: challenge.points,
    });
    navigate('/challenge');
  };

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 pb-12 px-4">
        <div className="container mx-auto max-w-5xl">

          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="pt-8 pb-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-2"
            >
              <p className="text-sm font-medium text-primary tracking-widest uppercase mb-2">
                {greeting} ✨
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight">
                Welcome back,{' '}
                <span className="gradient-text">{user?.name || 'Creative'}</span>
              </h1>
              <p className="text-lg text-muted-foreground mt-3 max-w-xl">
                Your creative journey continues. Let's make today count.
              </p>
            </motion.div>
          </motion.section>

          {/* Quote */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            <TypewriterQuote />
          </motion.section>

          {/* Stats */}
          <section className="mb-10">
            <StatsSection
              currentStreak={profileData.currentStreak}
              totalSessions={profileData.totalSessions}
              badgesCount={profileData.badgesCount}
            />
          </section>

          {/* Challenges Section */}
          <section className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="flex items-end justify-between mb-6"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Rocket className="w-5 h-5 text-primary" />
                  <h2 className="text-2xl md:text-3xl font-display font-bold">
                    Today's Challenges
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Handpicked for you •{' '}
                  <span className="text-primary font-semibold">
                    {dailyChallenges.length} {dailyChallenges.length === 1 ? 'challenge' : 'challenges'}
                  </span>{' '}
                  ready
                </p>
              </div>
              {remainingChallengesCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllChallenges(!showAllChallenges)}
                  className="text-primary hover:text-primary/80 gap-1"
                >
                  {showAllChallenges ? (
                    <>Less <ChevronUp className="w-4 h-4" /></>
                  ) : (
                    <>+{remainingChallengesCount} more <ChevronDown className="w-4 h-4" /></>
                  )}
                </Button>
              )}
            </motion.div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="glass rounded-2xl h-48 animate-pulse">
                    <div className="h-full bg-muted/20 rounded-2xl" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <AnimatePresence mode="popLayout">
                  {visibleChallenges.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="col-span-2"
                    >
                      <GlassCard className="text-center py-16">
                        <Sparkles className="w-14 h-14 mx-auto mb-4 text-primary/40" />
                        <h3 className="text-xl font-display font-semibold mb-2">
                          No challenges match your hobbies yet
                        </h3>
                        <p className="text-muted-foreground mb-5 text-sm max-w-md mx-auto">
                          Update your hobbies in profile settings to see personalized challenges
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => navigate('/challenges')}
                          className="rounded-xl"
                        >
                          Browse All Challenges
                        </Button>
                      </GlassCard>
                    </motion.div>
                  ) : (
                    visibleChallenges.map((challenge, index) => (
                      <ChallengeCard
                        key={challenge.id}
                        challenge={challenge}
                        index={index}
                        onStart={handleStartChallenge}
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>
            )}
          </section>

        </div>
      </div>

      <LandingFooter />
    </div>
  );
}
