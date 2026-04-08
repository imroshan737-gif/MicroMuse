import { motion } from 'framer-motion';
import { Flame, Trophy, Star, Zap } from 'lucide-react';

interface StatsSectionProps {
  currentStreak: number;
  totalSessions: number;
  badgesCount: number;
}

const stats = [
  { key: 'streak', icon: Flame, label: 'Day Streak', gradient: 'from-primary to-accent' },
  { key: 'sessions', icon: Zap, label: 'Sessions', gradient: 'from-secondary to-primary' },
  { key: 'badges', icon: Star, label: 'Badges', gradient: 'from-accent to-primary' },
];

export default function StatsSection({ currentStreak, totalSessions, badgesCount }: StatsSectionProps) {
  const values = [currentStreak, totalSessions, badgesCount];

  return (
    <div className="grid grid-cols-3 gap-3 md:gap-5">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.key}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.1, type: 'spring', stiffness: 100 }}
          className="group relative"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"
            style={{ background: `linear-gradient(135deg, hsl(var(--primary) / 0.3), hsl(var(--accent) / 0.3))` }}
          />
          <div className="glass rounded-2xl p-4 md:p-6 text-center hover-lift relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-60" 
              style={{ background: `linear-gradient(to right, hsl(var(--primary)), hsl(var(--accent)))` }}
            />
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
              <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-foreground mb-1">
              {values[i]}
            </p>
            <p className="text-xs md:text-sm text-muted-foreground font-medium uppercase tracking-wider">
              {stat.label}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
