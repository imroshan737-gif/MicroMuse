import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import GlassCard from '@/components/GlassCard';

const motivationalQuotes = [
  "Small daily improvements lead to stunning results.",
  "Your hobby today is your legacy tomorrow.",
  "Consistency beats intensity. Show up every day.",
  "Every expert was once a beginner.",
  "The secret to getting ahead is getting started.",
  "Passion + Persistence = Progress.",
  "Your creative spark can light up the world.",
  "One challenge at a time, one day at a time.",
];

export default function TypewriterQuote() {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  const randomQuote = useMemo(() => {
    return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  }, []);

  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);
    
    let currentIndex = 0;
    const intervalId = setInterval(() => {
      if (currentIndex < randomQuote.length) {
        setDisplayedText(randomQuote.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsComplete(true);
        clearInterval(intervalId);
      }
    }, 50); // 50ms per character

    return () => clearInterval(intervalId);
  }, [randomQuote]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <GlassCard className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10" />
        <div className="relative py-8 px-6 text-center">
          <Sparkles className="w-8 h-8 mx-auto mb-4 text-primary animate-pulse" />
          <blockquote className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-foreground leading-tight min-h-[3rem] md:min-h-[4rem]">
            "{displayedText}
            {!isComplete && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block w-[3px] h-[1em] bg-primary ml-1 align-middle"
              />
            )}
            {isComplete && '"'}
          </blockquote>
        </div>
      </GlassCard>
    </motion.div>
  );
}
