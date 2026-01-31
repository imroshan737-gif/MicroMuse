import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Flame, Star, Calendar, Target, Award, TrendingUp, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface LeaderboardUser {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  total_points: number;
  current_streak: number;
  top_hobby: string | null;
  top_hobby_emoji: string | null;
}

interface UserStats {
  totalSessions: number;
  longestStreak: number;
  currentStreak: number;
  totalPoints: number;
  achievementsCount: number;
  hobbies: Array<{ name: string; emoji: string | null }>;
  memberSince: string;
}

interface UserProfileModalProps {
  user: LeaderboardUser | null;
  isOpen: boolean;
  onClose: () => void;
  rank: number;
}

export default function UserProfileModal({ user, isOpen, onClose, rank }: UserProfileModalProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchUserStats();
    }
  }, [isOpen, user]);

  const fetchUserStats = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch profile data
      const { data: profile } = await supabase
        .from('public_profiles')
        .select('total_sessions, longest_streak, current_streak, total_points, created_at')
        .eq('id', user.id)
        .single();

      // Fetch achievements count
      const { data: achievements } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', user.id);

      // Fetch user hobbies
      const { data: userHobbies } = await supabase
        .from('user_hobbies')
        .select('hobby_id')
        .eq('user_id', user.id)
        .order('display_order', { ascending: true })
        .limit(5);

      let hobbies: Array<{ name: string; emoji: string | null }> = [];
      
      if (userHobbies && userHobbies.length > 0) {
        const hobbyIds = userHobbies.map(h => h.hobby_id);
        const { data: hobbyDetails } = await supabase
          .from('hobbies')
          .select('name, emoji')
          .in('id', hobbyIds);
        
        if (hobbyDetails) {
          hobbies = hobbyDetails;
        }
      }

      setStats({
        totalSessions: profile?.total_sessions || 0,
        longestStreak: profile?.longest_streak || 0,
        currentStreak: profile?.current_streak || 0,
        totalPoints: profile?.total_points || 0,
        achievementsCount: achievements?.length || 0,
        hobbies,
        memberSince: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown',
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { color: 'bg-gradient-to-r from-yellow-400 to-amber-500', label: '🥇 Champion' };
    if (rank === 2) return { color: 'bg-gradient-to-r from-gray-300 to-gray-400', label: '🥈 Runner Up' };
    if (rank === 3) return { color: 'bg-gradient-to-r from-amber-500 to-orange-600', label: '🥉 Third Place' };
    if (rank <= 10) return { color: 'bg-gradient-to-r from-primary to-purple-500', label: '⭐ Top 10' };
    if (rank <= 50) return { color: 'bg-gradient-to-r from-blue-500 to-cyan-500', label: '🔥 Top 50' };
    return { color: 'bg-muted', label: 'Competitor' };
  };

  const rankBadge = getRankBadge(rank);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-background/95 backdrop-blur-xl border-white/20 p-0 overflow-hidden">
        {/* Header with gradient background */}
        <div className="relative h-32 bg-gradient-to-br from-primary/40 via-purple-500/30 to-accent/30 overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute bottom-4 left-4"
          >
            <Sparkles className="w-6 h-6 text-white/50" />
          </motion.div>
          
          {/* Avatar positioned at bottom of header */}
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center text-3xl font-bold text-primary-foreground border-4 border-background shadow-xl overflow-hidden"
            >
              {user?.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.full_name || 'User'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.full_name?.charAt(0) || user?.username?.charAt(0) || '?'
              )}
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-14 pb-6 px-6">
          {/* Name and username */}
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-foreground">
              {user?.full_name || 'Anonymous'}
            </h2>
            {user?.username && (
              <p className="text-primary/80">@{user.username}</p>
            )}
            <Badge className={`${rankBadge.color} mt-2 text-white border-0`}>
              {rankBadge.label} • Rank #{rank}
            </Badge>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 rounded-xl bg-muted/50 animate-pulse" />
              ))}
            </div>
          ) : stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-yellow-500/20 to-amber-500/10 rounded-xl p-3 text-center border border-yellow-500/20"
                >
                  <Trophy className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                  <p className="text-xl font-bold text-foreground">{stats.totalPoints.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Points</p>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-orange-500/20 to-red-500/10 rounded-xl p-3 text-center border border-orange-500/20"
                >
                  <Flame className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                  <p className="text-xl font-bold text-foreground">{stats.currentStreak}</p>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-purple-500/20 to-pink-500/10 rounded-xl p-3 text-center border border-purple-500/20"
                >
                  <Target className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                  <p className="text-xl font-bold text-foreground">{stats.totalSessions}</p>
                  <p className="text-xs text-muted-foreground">Sessions</p>
                </motion.div>
              </div>

              {/* Additional stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/30 rounded-xl p-3 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-muted-foreground">Longest Streak</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">{stats.longestStreak} days</p>
                </div>
                
                <div className="bg-muted/30 rounded-xl p-3 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Achievements</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">{stats.achievementsCount} earned</p>
                </div>
              </div>

              {/* Hobbies */}
              {stats.hobbies.length > 0 && (
                <div className="bg-muted/20 rounded-xl p-4 border border-white/10">
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <Star className="w-3 h-3" /> Hobbies
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {stats.hobbies.map((hobby, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm border border-primary/30"
                      >
                        {hobby.emoji && <span className="mr-1">{hobby.emoji}</span>}
                        {hobby.name}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}

              {/* Member since */}
              <div className="text-center pt-2">
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Member since {stats.memberSince}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
