import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Crown, Medal, Star, Flame, Zap, TrendingUp, Sparkles, ChevronDown, User } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import StressSupportLink from '@/components/StressSupportLink';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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

export default function Leaderboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [animateUpdate, setAnimateUpdate] = useState<string | null>(null);
  const [showCount, setShowCount] = useState(20);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [currentUserData, setCurrentUserData] = useState<LeaderboardUser | null>(null);

  useEffect(() => {
    fetchLeaderboard();
    
    // Subscribe to real-time updates on profiles table
    const channel = supabase
      .channel('leaderboard-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          console.log('Leaderboard update:', payload);
          if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
            setAnimateUpdate(payload.new.id as string);
            setTimeout(() => setAnimateUpdate(null), 2000);
          }
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLeaderboard = async () => {
    try {
      // Fetch all users by points for ranking
      const { data: profiles, error: profilesError } = await supabase
        .from('public_profiles')
        .select('id, full_name, username, avatar_url, total_points, current_streak')
        .order('total_points', { ascending: false });

      if (profilesError) throw profilesError;

      // Find current user's rank
      if (user && profiles) {
        const userIndex = profiles.findIndex(p => p.id === user.id);
        if (userIndex !== -1) {
          setUserRank(userIndex + 1);
        }
      }

      // For each user, get their most practiced hobby
      const usersWithHobbies: LeaderboardUser[] = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: userHobbies } = await supabase
            .from('user_hobbies')
            .select('hobby_id')
            .eq('user_id', profile.id!)
            .order('display_order', { ascending: true })
            .limit(1);

          let topHobby = null;
          let topHobbyEmoji = null;

          if (userHobbies && userHobbies.length > 0) {
            const { data: hobby } = await supabase
              .from('hobbies')
              .select('name, emoji')
              .eq('id', userHobbies[0].hobby_id)
              .single();
            
            if (hobby) {
              topHobby = hobby.name;
              topHobbyEmoji = hobby.emoji;
            }
          }

          return {
            id: profile.id!,
            full_name: profile.full_name,
            username: profile.username,
            avatar_url: profile.avatar_url,
            total_points: profile.total_points || 0,
            current_streak: profile.current_streak || 0,
            top_hobby: topHobby,
            top_hobby_emoji: topHobbyEmoji,
          };
        })
      );

      setUsers(usersWithHobbies);
      
      // Set current user data
      if (user) {
        const currentUser = usersWithHobbies.find(u => u.id === user.id);
        if (currentUser) {
          setCurrentUserData(currentUser);
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankGlow = (rank: number) => {
    if (rank === 1) return 'ring-2 ring-yellow-400/50 shadow-[0_0_30px_rgba(250,204,21,0.4)]';
    if (rank === 2) return 'ring-2 ring-gray-300/50 shadow-[0_0_20px_rgba(209,213,219,0.3)]';
    if (rank === 3) return 'ring-2 ring-amber-600/50 shadow-[0_0_20px_rgba(217,119,6,0.3)]';
    return '';
  };

  const getAvatarGradient = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600';
    if (rank === 2) return 'bg-gradient-to-br from-gray-200 via-gray-400 to-gray-500';
    if (rank === 3) return 'bg-gradient-to-br from-amber-400 via-amber-600 to-orange-700';
    return 'bg-gradient-primary';
  };

  const visibleUsers = users.slice(0, showCount);
  const hasMore = users.length > showCount;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="relative">
              <Trophy className="w-12 h-12 text-yellow-400" />
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 blur-xl bg-yellow-400/50 rounded-full"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold">
              <span className="bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                Leaderboard
              </span>
            </h1>
          </div>
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            <Zap className="w-4 h-4 text-primary animate-pulse" />
            Real-time rankings • Updated live
            <Zap className="w-4 h-4 text-primary animate-pulse" />
          </p>
        </motion.div>

        {/* Live indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center mb-6"
        >
          <div className="flex items-center gap-2 glass px-4 py-2 rounded-full">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium text-green-400">LIVE</span>
          </div>
        </motion.div>

        {/* User's Current Rank Card */}
        {userRank && currentUserData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <GlassCard className="p-4 bg-gradient-to-r from-primary/20 via-purple-500/10 to-primary/20 border-primary/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-lg font-bold text-primary-foreground overflow-hidden">
                    {currentUserData.avatar_url ? (
                      <img 
                        src={currentUserData.avatar_url} 
                        alt="Your avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Your Rank</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-primary">#{userRank}</span>
                      <span className="text-foreground font-medium">of {users.length}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Your Points</p>
                  <p className="text-2xl font-bold text-foreground">{currentUserData.total_points.toLocaleString()}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Leaderboard */}
        <GlassCard className="p-6 overflow-hidden">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No users on the leaderboard yet!</p>
              <p className="text-sm text-muted-foreground mt-1">Complete challenges to earn points and climb the ranks.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {visibleUsers.map((leaderboardUser, index) => {
                  const rank = index + 1;
                  const isUpdating = animateUpdate === leaderboardUser.id;
                  const isCurrentUser = user?.id === leaderboardUser.id;
                  
                  return (
                    <motion.div
                      key={leaderboardUser.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ 
                        opacity: 1, 
                        x: 0,
                        scale: isUpdating ? [1, 1.02, 1] : 1,
                      }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ 
                        delay: index * 0.03,
                        layout: { type: 'spring', stiffness: 300, damping: 30 },
                      }}
                      className={`
                        relative p-4 rounded-xl glass-strong
                        ${getRankGlow(rank)}
                        ${rank <= 3 ? 'bg-gradient-to-r from-white/10 to-transparent' : ''}
                        ${isCurrentUser ? 'ring-2 ring-primary/50 bg-primary/10' : ''}
                        transition-all duration-300 hover:scale-[1.02] hover:bg-white/10
                      `}
                    >
                      {/* Rank-based decorative elements */}
                      {rank === 1 && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                          className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400"
                        >
                          <Star className="w-full h-full fill-yellow-400" />
                        </motion.div>
                      )}

                      <div className="flex items-center gap-4">
                        {/* Rank */}
                        <div className="w-12 h-12 flex items-center justify-center">
                          {getRankIcon(rank)}
                        </div>

                        {/* Avatar */}
                        <div className={`
                          w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold
                          ${getAvatarGradient(rank)} text-white shadow-lg overflow-hidden
                        `}>
                          {leaderboardUser.avatar_url ? (
                            <img 
                              src={leaderboardUser.avatar_url} 
                              alt={leaderboardUser.full_name || 'User'} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            leaderboardUser.full_name?.charAt(0) || leaderboardUser.username?.charAt(0) || '?'
                          )}
                        </div>

                        {/* User info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-foreground truncate">
                              {leaderboardUser.full_name || 'Anonymous'}
                              {isCurrentUser && <span className="text-primary ml-1">(You)</span>}
                            </h3>
                            {leaderboardUser.username && (
                              <span className="text-sm text-primary/80 truncate">
                                @{leaderboardUser.username}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            {leaderboardUser.top_hobby && (
                              <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary flex items-center gap-1">
                                {leaderboardUser.top_hobby_emoji && <span>{leaderboardUser.top_hobby_emoji}</span>}
                                {leaderboardUser.top_hobby}
                              </span>
                            )}
                            {leaderboardUser.current_streak > 0 && (
                              <span className="text-xs text-orange-400 flex items-center gap-1">
                                <Flame className="w-3 h-3" />
                                {leaderboardUser.current_streak} day streak
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Points */}
                        <div className="text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            <span className={`
                              font-bold text-lg
                              ${rank === 1 ? 'text-yellow-400' : 
                                rank === 2 ? 'text-gray-300' : 
                                rank === 3 ? 'text-amber-500' : 'text-foreground'}
                            `}>
                              {leaderboardUser.total_points.toLocaleString()}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">points</span>
                        </div>
                      </div>

                      {/* Update animation overlay */}
                      {isUpdating && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 0.5, 0] }}
                          transition={{ duration: 1 }}
                          className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 rounded-xl pointer-events-none"
                        />
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Show More Button */}
              {hasMore && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="pt-4"
                >
                  <Button
                    variant="outline"
                    className="w-full glass hover:bg-white/10"
                    onClick={() => setShowCount(prev => prev + 20)}
                  >
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Show More ({users.length - showCount} remaining)
                  </Button>
                </motion.div>
              )}

              {/* Total count */}
              <div className="text-center pt-4 text-sm text-muted-foreground">
                Showing {Math.min(showCount, users.length)} of {users.length} users
              </div>
            </div>
          )}
        </GlassCard>

        {/* Stress Support Link */}
        <div className="mt-12">
          <StressSupportLink />
        </div>
      </div>
    </div>
  );
}
