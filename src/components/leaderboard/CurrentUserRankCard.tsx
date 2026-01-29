import { motion } from 'framer-motion';
import { User, Award, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import GlassCard from '@/components/GlassCard';

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

interface CurrentUserRankCardProps {
  userRank: number;
  currentUserData: LeaderboardUser;
  totalUsers: number;
  rankChange?: number;
}

export default function CurrentUserRankCard({ 
  userRank, 
  currentUserData, 
  totalUsers,
  rankChange = 0 
}: CurrentUserRankCardProps) {
  const getPercentile = () => {
    if (totalUsers <= 1) return 100;
    return Math.round((1 - (userRank - 1) / (totalUsers - 1)) * 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateX: -10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      style={{ transformStyle: 'preserve-3d' }}
      className="mb-8"
    >
      <GlassCard className="p-5 bg-gradient-to-r from-primary/25 via-purple-500/15 to-primary/25 border-primary/40 relative overflow-hidden">
        {/* 3D shine effect */}
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none"
        />
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-5">
            <motion.div 
              whileHover={{ scale: 1.1, rotateY: 180 }}
              transition={{ duration: 0.5 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-xl font-bold text-primary-foreground overflow-hidden shadow-[0_0_20px_rgba(139,92,246,0.5)] border-2 border-white/20"
            >
              {currentUserData.avatar_url ? (
                <img 
                  src={currentUserData.avatar_url} 
                  alt="Your avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-7 h-7" />
              )}
            </motion.div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Your Rank</p>
              <div className="flex items-center gap-3">
                <motion.span 
                  key={userRank}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  className="text-4xl font-bold text-primary drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                >
                  #{userRank}
                </motion.span>
                <span className="text-lg text-foreground font-medium">of {totalUsers}</span>
                
                {/* Rank change indicator */}
                {rankChange !== 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-bold ${
                      rankChange > 0 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {rankChange > 0 ? (
                      <>
                        <TrendingUp className="w-4 h-4" />
                        <span>+{rankChange}</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-4 h-4" />
                        <span>{rankChange}</span>
                      </>
                    )}
                  </motion.div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Top {getPercentile()}% of all users
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground font-medium">Your Points</p>
            <motion.p 
              key={currentUserData.total_points}
              initial={{ scale: 1.2, color: '#22c55e' }}
              animate={{ scale: 1, color: 'currentColor' }}
              className="text-4xl font-bold text-foreground"
            >
              {currentUserData.total_points.toLocaleString()}
            </motion.p>
            <div className="flex items-center justify-end gap-1 mt-1">
              <Award className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary">Keep climbing!</span>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
