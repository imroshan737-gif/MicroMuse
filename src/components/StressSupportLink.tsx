import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

export default function StressSupportLink() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-4 bg-gradient-to-t from-background/80 to-transparent pt-8"
    >
      <a 
        href="https://guardian-aura-72.lovable.app" 
        target="_blank" 
        rel="noopener noreferrer"
        className="group flex items-center gap-2 px-6 py-3 rounded-full glass border border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
      >
        <Heart className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
        <span className="text-base font-medium text-foreground">
          Not able to manage stress?{' '}
          <span className="text-primary underline underline-offset-2 group-hover:text-primary/80 transition-colors">
            Click here
          </span>
        </span>
      </a>
    </motion.div>
  );
}