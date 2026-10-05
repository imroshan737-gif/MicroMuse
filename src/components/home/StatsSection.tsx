import { motion } from 'framer-motion';
import { Flame, Star, Zap } from 'lucide-react';

interface StatsSectionProps {
  currentStreak: number;
  totalSessions: number;
  badgesCount: number;
}

const stats = [
  { key: 'streak', icon: Flame, label: 'Day streak' },
  { key: 'sessions', icon: Zap, label: 'Sessions' },
  { key: 'badges', icon: Star, label: 'Badges' },
];

export default function StatsSection({ currentStreak, totalSessions, badgesCount }: StatsSectionProps) {
  const values = [currentStreak, totalSessions, badgesCount];

  return (
    <div className="glass rounded-2xl divide-y divide-foreground/10 sm:grid sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.key}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-4 px-5 py-5 md:px-6"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <stat.icon className="w-4 h-4 text-primary" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-2xl md:text-3xl font-semibold tabular-nums leading-none tracking-tight text-foreground">
              {values[i]}
            </p>
            <p className="mt-1.5 eyebrow">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}