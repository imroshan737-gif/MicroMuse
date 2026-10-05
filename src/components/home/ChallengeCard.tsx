import { motion } from 'framer-motion';
import { Clock, ArrowRight } from 'lucide-react';
import { Challenge } from '@/hooks/useChallenges';

interface ChallengeCardProps {
  challenge: Challenge;
  index: number;
  onStart: (challenge: Challenge) => void;
}

export default function ChallengeCard({ challenge, index, onStart }: ChallengeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      layout
      className="group"
    >
      <button
        type="button"
        onClick={() => onStart(challenge)}
        className="glass hover-lift w-full h-full text-left rounded-2xl p-5 md:p-6 flex flex-col hover:border-primary/30"
      >
        {/* Meta row */}
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
            {challenge.category}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
            <Clock className="w-3.5 h-3.5" strokeWidth={2} />
            {challenge.duration} min
          </span>
        </div>

        {/* Content */}
        <h3 className="mt-4 font-display text-lg md:text-xl font-semibold leading-snug text-foreground">
          {challenge.title}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-grow">
          {challenge.description}
        </p>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="capitalize">{challenge.difficulty}</span>
            <span className="w-1 h-1 rounded-full bg-foreground/30" />
            <span className="text-foreground/80 font-medium tabular-nums">{challenge.points} pts</span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground shadow-sm transition-all group-hover:shadow-md group-hover:brightness-95">
            Start
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </button>
    </motion.div>
  );
}