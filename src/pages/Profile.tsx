import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import GlassCard from '@/components/GlassCard';
import { Trophy, Flame, Star, Calendar, Music, Palette, PenTool, Award } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';

const mockAchievements = [
  { id: '1', name: 'First Steps', description: 'Complete your first session', icon: Star, earned: true },
  { id: '2', name: 'Week Warrior', description: '7-day streak', icon: Flame, earned: true },
  { id: '3', name: 'Melody Maker', description: 'Complete 10 music sessions', icon: Music, earned: false },
  { id: '4', name: 'Art Enthusiast', description: 'Complete 10 art sessions', icon: Palette, earned: false },
];

const mockSessions = [
  { id: '1', title: 'Morning Melody', category: 'music', date: '2025-01-20', score: 89 },
  { id: '2', title: 'Emotion in Color', category: 'art', date: '2025-01-19', score: 92 },
  { id: '3', title: 'Micro Story', category: 'writing', date: '2025-01-18', score: 85 },
];

export default function Profile() {
  const user = useStore((state) => state.user);
  
  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-6xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="flex flex-col md:flex-row items-center gap-6 p-8">
            <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center text-3xl font-bold text-primary-foreground">
              {user?.name?.charAt(0) || 'C'}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-display font-bold mb-2">
                {user?.name || 'Creative Explorer'}
              </h1>
              <p className="text-muted-foreground mb-4">
                {user?.email || 'explorer@micromuse.app'}
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {user?.interests.map((interest) => (
                  <Badge key={interest} variant="outline" className="glass">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
            <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90">
              Edit Profile
            </Button>
          </GlassCard>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <GlassCard className="text-center p-6">
            <Flame className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-3xl font-bold mb-1">{user?.streak || 0}</p>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </GlassCard>
          <GlassCard className="text-center p-6">
            <Trophy className="w-8 h-8 text-secondary mx-auto mb-2" />
            <p className="text-3xl font-bold mb-1">{user?.totalSessions || 0}</p>
            <p className="text-sm text-muted-foreground">Sessions</p>
          </GlassCard>
          <GlassCard className="text-center p-6">
            <Award className="w-8 h-8 text-accent mx-auto mb-2" />
            <p className="text-3xl font-bold mb-1">{user?.badges.length || 0}</p>
            <p className="text-sm text-muted-foreground">Badges</p>
          </GlassCard>
          <GlassCard className="text-center p-6">
            <Star className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-3xl font-bold mb-1">87</p>
            <p className="text-sm text-muted-foreground">Avg Score</p>
          </GlassCard>
        </div>
        
        <div>
          <h2 className="text-2xl font-display font-bold mb-4">Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className={`flex items-center gap-4 ${!achievement.earned && 'opacity-50'}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    achievement.earned ? 'bg-gradient-primary' : 'bg-muted'
                  }`}>
                    <achievement.icon className={`w-6 h-6 ${
                      achievement.earned ? 'text-primary-foreground' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{achievement.name}</h3>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-display font-bold mb-4">Recent Sessions</h2>
          <div className="space-y-3">
            {mockSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                      <Music className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{session.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{session.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{session.score}</p>
                    <p className="text-xs text-muted-foreground">Score</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
