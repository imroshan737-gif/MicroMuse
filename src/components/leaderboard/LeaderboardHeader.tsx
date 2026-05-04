import { motion } from 'framer-motion';
import { Trophy, Radio } from 'lucide-react';

export default function LeaderboardHeader() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="text-center mb-6"
      >
        <div className="inline-flex items-center gap-3 mb-3">
          <div className="relative w-11 h-11 rounded-xl glass-strong flex items-center justify-center border border-primary/20">
            <Trophy className="w-5 h-5 text-primary" strokeWidth={1.75} />
            <motion.div
              animate={{ opacity: [0.15, 0.4, 0.15] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 rounded-xl bg-primary/10 blur-xl -z-10"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight">
            Leaderboard
          </h1>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span className="tracking-wide">Live rankings · updated in real time</span>
        </div>
      </motion.div>
    </>
  );
}
