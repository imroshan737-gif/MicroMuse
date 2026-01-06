import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

export default function StressSupportLink() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="w-full flex justify-center py-8 mt-8"
    >
      <a 
        href="https://guardian-aura-72.lovable.app" 
        target="_blank" 
        rel="noopener noreferrer"
        className="group flex items-center gap-3 px-8 py-4 rounded-2xl glass border-2 border-primary/30 hover:border-primary transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 bg-gradient-to-r from-primary/5 to-primary/10"
      >
        <Heart className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
        <span className="text-lg font-semibold text-foreground">
          Not able to manage stress?{' '}
          <span className="text-primary underline underline-offset-4 group-hover:text-primary/80 transition-colors font-bold">
            Click here
          </span>
        </span>
      </a>
    </motion.div>
  );
}