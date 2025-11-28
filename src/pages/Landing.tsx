import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Sparkles, Music, Palette, PenTool, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();
  
  const features = [
    {
      icon: Music,
      title: 'Musical Mastery',
      description: '10-minute focused practice sessions with AI feedback',
    },
    {
      icon: Palette,
      title: 'Artistic Expression',
      description: 'Daily creative prompts to unlock your inner artist',
    },
    {
      icon: PenTool,
      title: 'Writing Brilliance',
      description: 'Micro-challenges to sharpen your storytelling',
    },
    {
      icon: Zap,
      title: 'Dance & Movement',
      description: 'Express yourself through motion and rhythm',
    },
  ];
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-4xl mx-auto space-y-8"
      >
        <div className="space-y-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full"
          >
            <Sparkles className="w-5 h-5 text-primary animate-pulse-glow" />
            <span className="text-sm font-medium">Where creativity meets consistency</span>
          </motion.div>
          
          <h1 className="text-6xl md:text-7xl font-display font-bold leading-tight">
            <span className="gradient-text">10 Minutes</span>
            <br />
            <span className="text-foreground">A Day to Mastery</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your creative skills with focused micro-sessions. 
            AI-powered feedback, immersive 3D environments, and a supportive community 
            await your daily practice.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-gradient-primary hover:opacity-90 text-primary-foreground text-lg px-8 py-6 rounded-xl shadow-glow-primary transition-all hover:scale-105"
            onClick={() => navigate('/onboarding')}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Start Your Journey
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="glass text-lg px-8 py-6 rounded-xl hover:bg-primary/10"
          >
            Watch Demo
          </Button>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              className="glass p-6 rounded-2xl hover-lift"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="pt-8 text-sm text-muted-foreground"
        >
          <p>Join 50,000+ creators practicing daily</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
