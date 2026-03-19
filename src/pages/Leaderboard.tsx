import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import LeaderboardHeader from '@/components/leaderboard/LeaderboardHeader';
import LeaderboardUserCard, { LeaderboardUser } from '@/components/leaderboard/LeaderboardUserCard';
import CurrentUserRankCard from '@/components/leaderboard/CurrentUserRankCard';
import UserProfileModal from '@/components/leaderboard/UserProfileModal';

const PAGE_SIZE = 20;

export default function Leaderboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [animateUpdate, setAnimateUpdate] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [currentUserData, setCurrentUserData] = useState<LeaderboardUser | null>(null);
  const [rankChanges, setRankChanges] = useState<Record<string, number>>({});
  const previousRanksRef = useRef<Record<string, number>>({});
  const [selectedUser, setSelectedUser] = useState<LeaderboardUser | null>(null);
  const [selectedUserRank, setSelectedUserRank] = useState<number>(0);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
    
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
      const { data: profiles, error: profilesError } = await supabase
        .from('public_profiles')
        .select('id, full_name, username, avatar_url, total_points, current_streak')
        .order('total_points', { ascending: false });

      if (profilesError) throw profilesError;

      const newRankChanges: Record<string, number> = {};
      profiles?.forEach((profile, index) => {
        const newRank = index + 1;
        const prevRank = previousRanksRef.current[profile.id!];
        if (prevRank && prevRank !== newRank) {
          newRankChanges[profile.id!] = prevRank - newRank;
        }
        previousRanksRef.current[profile.id!] = newRank;
      });
      
      if (Object.keys(newRankChanges).length > 0) {
        setRankChanges(newRankChanges);
        setTimeout(() => setRankChanges({}), 3000);
      }

      if (user && profiles) {
        const userIndex = profiles.findIndex(p => p.id === user.id);
        if (userIndex !== -1) {
          setUserRank(userIndex + 1);
        }
      }

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

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleUsers = users.slice(startIndex, startIndex + PAGE_SIZE);

  const isUserOnCurrentPage = userRank 
    ? userRank > startIndex && userRank <= startIndex + PAGE_SIZE 
    : false;
  const isUserOutsideVisible = userRank && !isUserOnCurrentPage && currentUserData;

  const handleUserClick = (leaderboardUser: LeaderboardUser, rank: number) => {
    setSelectedUser(leaderboardUser);
    setSelectedUserRank(rank);
    setIsProfileModalOpen(true);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <LeaderboardHeader />

        {userRank && currentUserData && (
          <CurrentUserRankCard 
            userRank={userRank}
            currentUserData={currentUserData}
            totalUsers={users.length}
            rankChange={rankChanges[currentUserData.id]}
          />
        )}

        <GlassCard className="p-6 overflow-hidden relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.1, 1] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ rotate: -360, scale: [1, 1.2, 1] }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 rounded-full blur-3xl"
            />
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                  className="h-24 rounded-2xl bg-gradient-to-r from-white/5 via-white/10 to-white/5" 
                />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              </motion.div>
              <p className="text-xl text-muted-foreground">No users on the leaderboard yet!</p>
              <p className="text-sm text-muted-foreground mt-2">Complete challenges to earn points and climb the ranks.</p>
            </div>
          ) : (
            <div className="space-y-3 relative z-10">
              <AnimatePresence mode="popLayout">
                {visibleUsers.map((leaderboardUser, index) => {
                  const rank = startIndex + index + 1;
                  const isUpdating = animateUpdate === leaderboardUser.id;
                  const isCurrentUser = user?.id === leaderboardUser.id;
                  
                  return (
                    <LeaderboardUserCard
                      key={leaderboardUser.id}
                      user={leaderboardUser}
                      rank={rank}
                      isCurrentUser={isCurrentUser}
                      isUpdating={isUpdating}
                      index={index}
                      rankChange={rankChanges[leaderboardUser.id]}
                      onClick={() => handleUserClick(leaderboardUser, rank)}
                    />
                  );
                })}
              </AnimatePresence>

              {isUserOutsideVisible && (
                <>
                  <div className="flex items-center gap-4 py-4">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-muted-foreground/30 to-transparent" />
                    <span className="text-sm text-muted-foreground px-4">• • •</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-muted-foreground/30 to-transparent" />
                  </div>
                  <LeaderboardUserCard
                    user={currentUserData}
                    rank={userRank}
                    isCurrentUser={true}
                    isUpdating={animateUpdate === currentUserData.id}
                    index={0}
                    rankChange={rankChanges[currentUserData.id]}
                    onClick={() => handleUserClick(currentUserData, userRank)}
                  />
                </>
              )}

              {/* Pagination */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between pt-6 border-t border-white/10 mt-4"
              >
                <p className="text-sm text-primary font-medium">
                  Total users: <span className="font-bold">{users.length}</span>
                </p>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-9 h-9 glass border-white/20 hover:bg-white/10 disabled:opacity-30"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  {getPageNumbers().map((page, i) => (
                    typeof page === 'string' ? (
                      <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground">•</span>
                    ) : (
                      <Button
                        key={page}
                        variant="outline"
                        size="icon"
                        className={`w-9 h-9 border transition-all duration-200 ${
                          page === currentPage 
                            ? 'bg-primary/20 border-primary text-primary font-bold shadow-[0_0_10px_hsl(var(--primary)/0.3)]' 
                            : 'glass border-white/20 hover:bg-white/10 text-muted-foreground'
                        }`}
                        onClick={() => goToPage(page)}
                      >
                        {page}
                      </Button>
                    )
                  ))}

                  <Button
                    variant="outline"
                    size="icon"
                    className="w-9 h-9 glass border-white/20 hover:bg-white/10 disabled:opacity-30"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </GlassCard>

        <UserProfileModal
          user={selectedUser}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          rank={selectedUserRank}
        />
      </div>
    </div>
  );
}
  const { user } = useAuth();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [animateUpdate, setAnimateUpdate] = useState<string | null>(null);
  const [showCount, setShowCount] = useState(20);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [currentUserData, setCurrentUserData] = useState<LeaderboardUser | null>(null);
  const [rankChanges, setRankChanges] = useState<Record<string, number>>({});
  const previousRanksRef = useRef<Record<string, number>>({});
  const [selectedUser, setSelectedUser] = useState<LeaderboardUser | null>(null);
  const [selectedUserRank, setSelectedUserRank] = useState<number>(0);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
    
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
      const { data: profiles, error: profilesError } = await supabase
        .from('public_profiles')
        .select('id, full_name, username, avatar_url, total_points, current_streak')
        .order('total_points', { ascending: false });

      if (profilesError) throw profilesError;

      // Calculate rank changes before updating
      const newRankChanges: Record<string, number> = {};
      profiles?.forEach((profile, index) => {
        const newRank = index + 1;
        const prevRank = previousRanksRef.current[profile.id!];
        if (prevRank && prevRank !== newRank) {
          newRankChanges[profile.id!] = prevRank - newRank; // positive = moved up
        }
        previousRanksRef.current[profile.id!] = newRank;
      });
      
      if (Object.keys(newRankChanges).length > 0) {
        setRankChanges(newRankChanges);
        // Clear rank changes after animation
        setTimeout(() => setRankChanges({}), 3000);
      }

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

  const visibleUsers = users.slice(0, showCount);
  const hasMore = users.length > showCount;
  
  // Check if current user is outside visible list
  const isUserOutsideVisible = userRank && userRank > showCount && currentUserData;

  const handleUserClick = (leaderboardUser: LeaderboardUser, rank: number) => {
    setSelectedUser(leaderboardUser);
    setSelectedUserRank(rank);
    setIsProfileModalOpen(true);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <LeaderboardHeader />

        {/* User's Current Rank Card */}
        {userRank && currentUserData && (
          <CurrentUserRankCard 
            userRank={userRank}
            currentUserData={currentUserData}
            totalUsers={users.length}
            rankChange={rankChanges[currentUserData.id]}
          />
        )}

        {/* Leaderboard */}
        <GlassCard className="p-6 overflow-hidden relative">
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ 
                rotate: -360,
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 rounded-full blur-3xl"
            />
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                  className="h-24 rounded-2xl bg-gradient-to-r from-white/5 via-white/10 to-white/5" 
                />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              </motion.div>
              <p className="text-xl text-muted-foreground">No users on the leaderboard yet!</p>
              <p className="text-sm text-muted-foreground mt-2">Complete challenges to earn points and climb the ranks.</p>
            </div>
          ) : (
            <div className="space-y-3 relative z-10">
              <AnimatePresence mode="popLayout">
                {visibleUsers.map((leaderboardUser, index) => {
                  const rank = index + 1;
                  const isUpdating = animateUpdate === leaderboardUser.id;
                  const isCurrentUser = user?.id === leaderboardUser.id;
                  
                  return (
                    <LeaderboardUserCard
                      key={leaderboardUser.id}
                      user={leaderboardUser}
                      rank={rank}
                      isCurrentUser={isCurrentUser}
                      isUpdating={isUpdating}
                      index={index}
                      rankChange={rankChanges[leaderboardUser.id]}
                      onClick={() => handleUserClick(leaderboardUser, rank)}
                    />
                  );
                })}
              </AnimatePresence>

              {/* Show current user if outside top visible */}
              {isUserOutsideVisible && (
                <>
                  <div className="flex items-center gap-4 py-4">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-muted-foreground/30 to-transparent" />
                    <span className="text-sm text-muted-foreground px-4">• • •</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-muted-foreground/30 to-transparent" />
                  </div>
                  <LeaderboardUserCard
                    user={currentUserData}
                    rank={userRank}
                    isCurrentUser={true}
                    isUpdating={animateUpdate === currentUserData.id}
                    index={0}
                    rankChange={rankChanges[currentUserData.id]}
                    onClick={() => handleUserClick(currentUserData, userRank)}
                  />
                </>
              )}

              {/* Show More Button */}
              {hasMore && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="pt-6"
                >
                  <Button
                    variant="outline"
                    className="w-full glass hover:bg-white/10 border-white/20 hover:border-white/40 transition-all duration-300 py-6 text-base"
                    onClick={() => setShowCount(prev => prev + 20)}
                  >
                    <ChevronDown className="w-5 h-5 mr-2 animate-bounce" />
                    Show More ({users.length - showCount} remaining)
                  </Button>
                </motion.div>
              )}

              {/* Total count */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center pt-6 text-sm text-muted-foreground"
              >
                Showing {Math.min(showCount, users.length)} of {users.length} users
              </motion.div>
            </div>
          )}
        </GlassCard>

        {/* User Profile Modal */}
        <UserProfileModal
          user={selectedUser}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          rank={selectedUserRank}
        />
      </div>
    </div>
  );
}
