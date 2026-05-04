import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, Target, Flame, Award, Star, Zap, Crown, 
  Music, Palette, PenTool, Calendar, TrendingUp,
  Clock, Users, Heart
} from 'lucide-react';
import { useUserStats } from '@/hooks/useUserStats';
import { useUserAchievements } from '@/hooks/useUserAchievements';
import { useUserHobbies } from '@/hooks/useUserHobbies';
import StressSupportLink from '@/components/StressSupportLink';

const iconMap: Record<string, any> = {
  Star, Flame, Music, Palette, Zap, Calendar, Crown, Clock, Users, Heart, Trophy
};

export default function Achievements() {
  const { stats, loading: statsLoading } = useUserStats();
  const { achievements, loading: achievementsLoading } = useUserAchievements();
  const { hobbies, loading: hobbiesLoading } = useUserHobbies();

  const earnedCount = achievements.filter(a => a.earned).length;
  const totalCount = achievements.length;

  const statsDisplay = [
    { 
      label: 'Highest Score', 
      value: stats.highestScore.toString(), 
      icon: Trophy, 
      color: 'text-primary',
      description: 'Your best performance'
    },
    { 
      label: 'Longest Streak', 
      value: stats.longestStreak.toString(), 
      icon: Flame, 
      color: 'text-orange-500',
      description: 'days in a row'
    },
    { 
      label: 'Best Day', 
      value: stats.bestDay.toString(), 
      icon: Zap, 
      color: 'text-accent',
      description: 'sessions completed'
    },
    { 
      label: 'Total Points', 
      value: stats.totalPoints.toLocaleString(), 
      icon: Star, 
      color: 'text-secondary',
      description: 'lifetime earned'
    },
  ];

  const categoryProgress = hobbies.map(hobby => ({
    category: hobby.name,
    completed: 0, // Will be calculated from user_activity in future
    total: 50,
    icon: iconMap[hobby.icon || 'Star'] || Star,
    color: 'primary',
  }));

  if (statsLoading || achievementsLoading || hobbiesLoading) {
    return (
      <div className="min-h-screen pt-6 pb-12 px-4 flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading achievements...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-6 pb-12 px-4">
      <div className="container mx-auto max-w-6xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/40" />
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Your Journey</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/40" />
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-semibold tracking-tight text-center mb-3">
            Achievements
          </h1>
          <p className="text-base text-muted-foreground text-center mb-8 max-w-xl mx-auto">
            Quiet milestones, bright proof. Every badge below is a moment you showed up.
          </p>

          <GlassCard className="mb-8 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-1">Unlocked</p>
                <h3 className="text-3xl font-display font-semibold">
                  <span className="text-primary">{earnedCount}</span>
                  <span className="text-muted-foreground/60"> / {totalCount}</span>
                </h3>
              </div>
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl glass-strong border border-primary/20 flex items-center justify-center">
                  <Trophy className="w-7 h-7 text-primary" strokeWidth={1.75} />
                </div>
              </div>
            </div>
            <Progress value={(earnedCount / totalCount) * 100} className="h-1.5" />
          </GlassCard>
        </motion.div>

        <div>
          <h2 className="text-2xl font-display font-bold mb-4">Record Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsDisplay.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard hover className="text-center">
                  <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
                  <p className="text-4xl font-bold mb-1">{stat.value}</p>
                  <p className="text-sm font-semibold mb-1">{stat.label}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-display font-bold mb-4">Category Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryProgress.map((cat, index) => (
              <motion.div
                key={cat.category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard>
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-${cat.color} flex items-center justify-center`}>
                      <cat.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-semibold text-lg">{cat.category}</h3>
                      <p className="text-sm text-muted-foreground">
                        {cat.completed} / {cat.total} sessions
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {Math.round((cat.completed / cat.total) * 100)}%
                      </p>
                    </div>
                  </div>
                  <Progress value={(cat.completed / cat.total) * 100} className="h-2" />
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-display font-bold mb-4">All Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard 
                  hover 
                  className={`h-full ${!achievement.earned && 'opacity-60'}`}
                >
                  <div className="flex items-start gap-3 mb-3">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                      achievement.earned 
                        ? 'bg-gradient-primary shadow-glow-primary' 
                        : 'bg-muted'
                    }`}>
                      {(() => {
                        const Icon = iconMap[achievement.icon] || Star;
                        return <Icon className={`w-7 h-7 ${
                          achievement.earned ? 'text-primary-foreground' : 'text-muted-foreground'
                        }`} />;
                      })()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-semibold text-lg mb-1">
                        {achievement.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {achievement.description}
                      </p>
                      {achievement.earned && achievement.earnedDate && (
                        <Badge variant="outline" className="glass text-xs">
                          Earned {achievement.earnedDate}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {!achievement.earned && achievement.progress !== undefined && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold">
                          {achievement.progress} / {achievement.total}
                        </span>
                      </div>
                      <Progress 
                        value={(achievement.progress / achievement.total!) * 100} 
                        className="h-1.5"
                      />
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stress Support Link at the end of page content */}
        <StressSupportLink />
      </div>
    </div>
  );
}
