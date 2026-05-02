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
      <div className="flex-1 pb-12 px-4 relative overflow-hidden">
        {/* Ambient animated orbs */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <motion.div
            className="absolute -top-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-primary/20 blur-3xl"
            animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-40 -right-32 w-[26rem] h-[26rem] rounded-full bg-accent/20 blur-3xl"
            animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 left-1/3 w-[22rem] h-[22rem] rounded-full bg-secondary/20 blur-3xl"
            animate={{ x: [0, 20, 0], y: [0, -30, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        <div className="container mx-auto max-w-5xl">

          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="pt-10 pb-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-2"
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full mb-4 border border-primary/20"
              >
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-xs font-semibold text-primary tracking-widest uppercase">
                  {greeting}
                </span>
              </motion.div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.05] tracking-tight">
                Welcome back,{' '}
                <span className="gradient-text relative inline-block">
                  {user?.name || 'Creative'}
                  <motion.span
                    className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-primary rounded-full origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
                  />
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mt-4 max-w-xl">
                Your creative journey continues. Let's make today <span className="text-foreground font-semibold">count</span>.
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
