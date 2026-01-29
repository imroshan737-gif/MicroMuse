import { motion } from 'framer-motion';
import { Trophy, Zap, Sparkles } from 'lucide-react';

export default function LeaderboardHeader() {
  return (
    <>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-4 mb-4">
          <div className="relative">
            <motion.div
              animate={{ 
                rotateY: [0, 360],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <Trophy className="w-16 h-16 text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.6)]" />
            </motion.div>
            <motion.div
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 blur-2xl bg-yellow-400/40 rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-4"
            >
              <Sparkles className="absolute top-0 left-1/2 w-4 h-4 text-yellow-300" />
              <Sparkles className="absolute bottom-0 right-0 w-3 h-3 text-amber-400" />
              <Sparkles className="absolute top-1/2 left-0 w-3 h-3 text-yellow-500" />
            </motion.div>
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold">
            <span className="bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(250,204,21,0.3)]">
              Leaderboard
            </span>
          </h1>
        </div>
        <p className="text-muted-foreground flex items-center justify-center gap-2 text-lg">
          <Zap className="w-5 h-5 text-primary animate-pulse" />
          Real-time rankings • Updated live
          <Zap className="w-5 h-5 text-primary animate-pulse" />
        </p>
      </motion.div>

      {/* Live indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex justify-center mb-8"
      >
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-3 glass px-6 py-3 rounded-full border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.2)]"
        >
          <span className="relative flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
          </span>
          <span className="text-base font-bold text-green-400 tracking-wider">LIVE</span>
        </motion.div>
      </motion.div>
    </>
  );
}
