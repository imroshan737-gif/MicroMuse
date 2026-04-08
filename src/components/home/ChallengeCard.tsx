import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Play, ArrowRight } from 'lucide-react';
import { Challenge } from '@/hooks/useChallenges';

const categoryEmojis: Record<string, string> = {
  music: '🎵', art: '🎨', writing: '✍️', dance: '💃',
  coding: '💻', photography: '📸', fitness: '💪',
  cooking: '🍳', gaming: '🎮', design: '🖌️', studies: '📚',
};

const categoryGradients: Record<string, string> = {
  music: 'from-purple-500/20 to-pink-500/20',
  art: 'from-rose-500/20 to-orange-500/20',
  writing: 'from-blue-500/20 to-cyan-500/20',
  dance: 'from-pink-500/20 to-fuchsia-500/20',
  coding: 'from-green-500/20 to-emerald-500/20',
  photography: 'from-amber-500/20 to-yellow-500/20',
  fitness: 'from-red-500/20 to-orange-500/20',
  cooking: 'from-orange-500/20 to-amber-500/20',
  gaming: 'from-indigo-500/20 to-purple-500/20',
  design: 'from-teal-500/20 to-cyan-500/20',
  studies: 'from-blue-500/20 to-indigo-500/20',
};

interface ChallengeCardProps {
  challenge: Challenge;
  index: number;
  onStart: (challenge: Challenge) => void;
}

export default function ChallengeCard({ challenge, index, onStart }: ChallengeCardProps) {
  const emoji = categoryEmojis[challenge.category] || '✨';
  const gradient = categoryGradients[challenge.category] || 'from-primary/20 to-accent/20';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 120 }}
      layout
      className="group"
    >
      <div className={`glass rounded-2xl p-5 md:p-6 h-full relative overflow-hidden hover-lift transition-all duration-300 border border-border/50 hover:border-primary/30`}>
        {/* Gradient overlay on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        
        <div className="relative flex flex-col h-full">
          {/* Top row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{emoji}</span>
              <Badge variant="outline" className="glass text-xs font-semibold capitalize border-primary/20 text-primary">
                {challenge.category}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <Clock className="w-3.5 h-3.5" />
              <span>{challenge.duration}m</span>
              <span className="text-primary font-bold ml-1">+{challenge.points}</span>
            </div>
          </div>
          
          {/* Content */}
          <h3 className="text-lg md:text-xl font-display font-bold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">
            {challenge.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-5 flex-grow line-clamp-2 leading-relaxed">
            {challenge.description}
          </p>
          
          {/* Bottom row */}
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs capitalize px-3 py-1">
              {challenge.difficulty}
            </Badge>
            <Button
              onClick={() => onStart(challenge)}
              size="sm"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white rounded-xl gap-2 shadow-md hover:shadow-lg transition-shadow"
            >
              <Play className="w-3.5 h-3.5" />
              Start
              <ArrowRight className="w-3.5 h-3.5 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
