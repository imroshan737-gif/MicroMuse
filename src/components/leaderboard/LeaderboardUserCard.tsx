import { motion } from 'framer-motion';
import { Crown, Medal, Star, Flame, TrendingUp, TrendingDown, Minus, User, Sparkles } from 'lucide-react';

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

interface LeaderboardUserCardProps {
  user: LeaderboardUser;
  rank: number;
  isCurrentUser: boolean;
  isUpdating: boolean;
  index: number;
  rankChange?: number; // positive = moved up, negative = moved down, 0 = no change
}

export default function LeaderboardUserCard({
  user,
  rank,
  isCurrentUser,
  isUpdating,
  index,
  rankChange = 0,
}: LeaderboardUserCardProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-7 h-7 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300 drop-shadow-[0_0_8px_rgba(209,213,219,0.6)]" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.6)]" />;
    return <span className="text-xl font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankGlow = (rank: number) => {
    if (rank === 1) return 'ring-2 ring-yellow-400/60 shadow-[0_0_40px_rgba(250,204,21,0.5),inset_0_1px_0_rgba(255,255,255,0.2)]';
    if (rank === 2) return 'ring-2 ring-gray-300/60 shadow-[0_0_30px_rgba(209,213,219,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]';
    if (rank === 3) return 'ring-2 ring-amber-600/60 shadow-[0_0_30px_rgba(217,119,6,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]';
    return '';
  };

  const getAvatarGradient = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 shadow-[0_0_20px_rgba(250,204,21,0.6)]';
    if (rank === 2) return 'bg-gradient-to-br from-gray-200 via-gray-400 to-gray-500 shadow-[0_0_15px_rgba(209,213,219,0.5)]';
    if (rank === 3) return 'bg-gradient-to-br from-amber-400 via-amber-600 to-orange-700 shadow-[0_0_15px_rgba(217,119,6,0.5)]';
    return 'bg-gradient-primary';
  };

  const getCardBackground = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500/20 via-amber-500/10 to-yellow-500/20';
    if (rank === 2) return 'bg-gradient-to-r from-gray-400/15 via-gray-300/10 to-gray-400/15';
    if (rank === 3) return 'bg-gradient-to-r from-amber-600/15 via-orange-500/10 to-amber-600/15';
    return '';
  };

  const RankChangeIndicator = () => {
    if (rankChange === 0) return null;
    
    const isUp = rankChange > 0;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0, x: isUp ? -10 : 10 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0 }}
        className={`
          absolute -right-2 -top-2 flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold
          ${isUp 
            ? 'bg-green-500/90 text-white shadow-[0_0_15px_rgba(34,197,94,0.6)]' 
            : 'bg-red-500/90 text-white shadow-[0_0_15px_rgba(239,68,68,0.6)]'
          }
        `}
      >
        {isUp ? (
          <>
            <TrendingUp className="w-3 h-3" />
            <span>+{rankChange}</span>
          </>
        ) : (
          <>
            <TrendingDown className="w-3 h-3" />
            <span>{rankChange}</span>
          </>
        )}
      </motion.div>
    );
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20, rotateY: -10 }}
      animate={{ 
        opacity: 1, 
        x: 0,
        rotateY: 0,
        scale: isUpdating ? [1, 1.02, 1] : 1,
      }}
      exit={{ opacity: 0, x: 20, rotateY: 10 }}
      transition={{ 
        delay: index * 0.02,
        layout: { type: 'spring', stiffness: 300, damping: 30 },
        rotateY: { duration: 0.5 }
      }}
      style={{ transformStyle: 'preserve-3d' }}
      className={`
        relative p-4 rounded-2xl backdrop-blur-xl border border-white/10
        ${getRankGlow(rank)}
        ${getCardBackground(rank)}
        ${isCurrentUser ? 'ring-2 ring-primary/60 bg-primary/15' : ''}
        transition-all duration-300 hover:scale-[1.02] hover:bg-white/10
        hover:shadow-[0_10px_40px_rgba(0,0,0,0.3)] hover:border-white/20
        transform-gpu
      `}
    >
      <RankChangeIndicator />
      
      {/* 3D shine effect */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"
        />
      </div>

      {/* Rank-based decorative elements */}
      {rank === 1 && (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-3 -right-3 w-10 h-10 text-yellow-400"
          >
            <Star className="w-full h-full fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -bottom-2 -left-2"
          >
            <Sparkles className="w-6 h-6 text-yellow-400/60" />
          </motion.div>
        </>
      )}

      <div className="flex items-center gap-4 relative z-10">
        {/* Rank */}
        <div className="w-14 h-14 flex items-center justify-center">
          <motion.div
            whileHover={{ scale: 1.1, rotate: rank <= 3 ? [0, -10, 10, 0] : 0 }}
            transition={{ duration: 0.3 }}
          >
            {getRankIcon(rank)}
          </motion.div>
        </div>

        {/* Avatar */}
        <motion.div 
          whileHover={{ scale: 1.1 }}
          className={`
            w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold
            ${getAvatarGradient(rank)} text-white overflow-hidden
            border-2 border-white/20
          `}
        >
          {user.avatar_url ? (
            <img 
              src={user.avatar_url} 
              alt={user.full_name || 'User'} 
              className="w-full h-full object-cover"
            />
          ) : (
            user.full_name?.charAt(0) || user.username?.charAt(0) || '?'
          )}
        </motion.div>

        {/* User info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-lg text-foreground truncate">
              {user.full_name || 'Anonymous'}
              {isCurrentUser && <span className="text-primary ml-1">(You)</span>}
            </h3>
            {user.username && (
              <span className="text-sm text-primary/80 truncate">
                @{user.username}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {user.top_hobby && (
              <motion.span 
                whileHover={{ scale: 1.05 }}
                className="text-xs px-3 py-1 rounded-full bg-primary/20 text-primary flex items-center gap-1.5 border border-primary/30"
              >
                {user.top_hobby_emoji && <span className="text-sm">{user.top_hobby_emoji}</span>}
                {user.top_hobby}
              </motion.span>
            )}
            {user.current_streak > 0 && (
              <span className="text-xs text-orange-400 flex items-center gap-1">
                <Flame className="w-4 h-4 animate-pulse" />
                {user.current_streak} day streak
              </span>
            )}
          </div>
        </div>

        {/* Points */}
        <div className="text-right">
          <div className="flex items-center gap-1.5 justify-end">
            <TrendingUp className="w-5 h-5 text-primary" />
            <motion.span 
              key={user.total_points}
              initial={{ scale: 1.2, color: '#22c55e' }}
              animate={{ scale: 1, color: rank === 1 ? '#facc15' : rank === 2 ? '#d1d5db' : rank === 3 ? '#d97706' : 'currentColor' }}
              className={`
                font-bold text-xl
                ${rank === 1 ? 'text-yellow-400' : 
                  rank === 2 ? 'text-gray-300' : 
                  rank === 3 ? 'text-amber-500' : 'text-foreground'}
              `}
            >
              {user.total_points.toLocaleString()}
            </motion.span>
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
          className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 rounded-2xl pointer-events-none"
        />
      )}
    </motion.div>
  );
}
