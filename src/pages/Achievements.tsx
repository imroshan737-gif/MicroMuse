import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, Target, Flame, Award, Star, Zap, Crown, 
  Music, Palette, PenTool, Calendar, TrendingUp,
  Clock, Users, Heart
} from 'lucide-react';
import { useStore } from '@/store/useStore';

const achievements = [
  { 
    id: '1', 
    name: 'First Steps', 
    description: 'Complete your first session', 
    icon: Star, 
    earned: true,
    category: 'milestone',
    earnedDate: '2025-01-15'
  },
  { 
    id: '2', 
    name: 'Week Warrior', 
    description: 'Maintain a 7-day streak', 
    icon: Flame, 
    earned: true,
    category: 'streak',
    earnedDate: '2025-01-20'
  },
  { 
    id: '3', 
    name: 'Melody Master', 
    description: 'Complete 10 music sessions', 
    icon: Music, 
    earned: true,
    category: 'category',
    progress: 10,
    total: 10,
    earnedDate: '2025-01-18'
  },
  { 
    id: '4', 
    name: 'Art Enthusiast', 
    description: 'Complete 10 art sessions', 
    icon: Palette, 
    earned: false,
    category: 'category',
    progress: 6,
    total: 10
  },
  { 
    id: '5', 
    name: 'Speed Demon', 
    description: 'Complete 5 sessions in one day', 
    icon: Zap, 
    earned: false,
    category: 'daily',
    progress: 3,
    total: 5
  },
  { 
    id: '6', 
    name: 'Consistent Creator', 
    description: 'Complete 30 total sessions', 
    icon: Calendar, 
    earned: true,
    category: 'milestone',
    earnedDate: '2025-01-22'
  },
  { 
    id: '7', 
    name: 'Perfect Score', 
    description: 'Achieve a score of 95 or higher', 
    icon: Crown, 
    earned: true,
    category: 'score',
    earnedDate: '2025-01-19'
  },
  { 
    id: '8', 
    name: 'Night Owl', 
    description: 'Complete 10 sessions after 10 PM', 
    icon: Clock, 
    earned: false,
    category: 'special',
    progress: 4,
    total: 10
  },
  { 
    id: '9', 
    name: 'Social Butterfly', 
    description: 'Participate in 5 collaborative sessions', 
    icon: Users, 
    earned: false,
    category: 'social',
    progress: 2,
    total: 5
  },
  { 
    id: '10', 
    name: 'Community Hero', 
    description: 'Receive 100 likes on your sessions', 
    icon: Heart, 
    earned: false,
    category: 'social',
    progress: 47,
    total: 100
  },
];

const stats = [
  { 
    label: 'Highest Score', 
    value: '96', 
    icon: Trophy, 
    color: 'text-primary',
    description: 'In "Morning Melody"'
  },
  { 
    label: 'Longest Streak', 
    value: '14', 
    icon: Flame, 
    color: 'text-orange-500',
    description: 'days in a row'
  },
  { 
    label: 'Best Day', 
    value: '8', 
    icon: Zap, 
    color: 'text-accent',
    description: 'sessions completed'
  },
  { 
    label: 'Total Points', 
    value: '4,280', 
    icon: Star, 
    color: 'text-secondary',
    description: 'lifetime earned'
  },
];

const categoryProgress = [
  { category: 'Music', completed: 12, total: 50, icon: Music, color: 'primary' },
  { category: 'Art', completed: 8, total: 50, icon: Palette, color: 'secondary' },
  { category: 'Writing', completed: 15, total: 50, icon: PenTool, color: 'accent' },
  { category: 'Dance', completed: 5, total: 50, icon: Zap, color: 'primary' },
];

export default function Achievements() {
  const user = useStore((state) => state.user);
  const earnedCount = achievements.filter(a => a.earned).length;
  const totalCount = achievements.length;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-6xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-2">
            Achievements
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Track your creative milestones and unlock new badges
          </p>
          
          <GlassCard className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-display font-bold">
                  {earnedCount} / {totalCount} Unlocked
                </h3>
                <p className="text-muted-foreground">
                  Keep creating to unlock more achievements
                </p>
              </div>
              <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center">
                <Trophy className="w-10 h-10 text-primary-foreground" />
              </div>
            </div>
            <Progress value={(earnedCount / totalCount) * 100} className="h-3" />
          </GlassCard>
        </motion.div>

        <div>
          <h2 className="text-2xl font-display font-bold mb-4">Record Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
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
                      <achievement.icon className={`w-7 h-7 ${
                        achievement.earned ? 'text-primary-foreground' : 'text-muted-foreground'
                      }`} />
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
      </div>
    </div>
  );
}
