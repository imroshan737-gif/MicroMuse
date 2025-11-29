import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Sparkles, Music, Palette, PenTool, Zap, Play, Trophy, Users, Target, Clock, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import GlassCard from '@/components/GlassCard';

export default function Landing() {
  const navigate = useNavigate();
  const [showDemo, setShowDemo] = useState(false);
  
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
            onClick={() => setShowDemo(true)}
          >
            <Play className="w-5 h-5 mr-2" />
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
          className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 border-t border-border/50"
        >
          <div className="text-center">
            <p className="text-3xl font-bold gradient-text mb-1">50K+</p>
            <p className="text-sm text-muted-foreground">Active Creators</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold gradient-text mb-1">2M+</p>
            <p className="text-sm text-muted-foreground">Sessions Completed</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold gradient-text mb-1">4.9★</p>
            <p className="text-sm text-muted-foreground">Average Rating</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold gradient-text mb-1">98%</p>
            <p className="text-sm text-muted-foreground">User Satisfaction</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="pt-12"
        >
          <h2 className="text-3xl font-display font-bold text-center mb-8">
            Why Choose MicroMuse?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard hover className="text-center p-8">
              <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-xl mb-2">
                Focused Practice
              </h3>
              <p className="text-muted-foreground">
                Just 10-15 minutes daily to build lasting creative skills without overwhelming your schedule
              </p>
            </GlassCard>
            <GlassCard hover className="text-center p-8">
              <div className="w-16 h-16 rounded-full bg-gradient-secondary flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-display font-semibold text-xl mb-2">
                AI-Powered Feedback
              </h3>
              <p className="text-muted-foreground">
                Get instant, personalized insights to improve your creativity and technique with every session
              </p>
            </GlassCard>
            <GlassCard hover className="text-center p-8">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-display font-semibold text-xl mb-2">
                Vibrant Community
              </h3>
              <p className="text-muted-foreground">
                Connect with fellow creators, share your work, and grow together in a supportive environment
              </p>
            </GlassCard>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="text-center pt-12"
        >
          <Button
            size="lg"
            className="bg-gradient-primary hover:opacity-90 text-primary-foreground text-xl px-12 py-8 rounded-2xl shadow-glow-primary"
            onClick={() => navigate('/onboarding')}
          >
            <Sparkles className="w-6 h-6 mr-2" />
            Begin Your Creative Journey
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • Free to start • Cancel anytime
          </p>
        </motion.div>
      </motion.div>

      <Dialog open={showDemo} onOpenChange={setShowDemo}>
        <DialogContent className="glass-strong max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl font-display">MicroMuse Demo</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-display font-semibold mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Daily Challenges
              </h3>
              <p className="text-muted-foreground mb-3">
                Start each day with fresh, AI-generated challenges tailored to your interests. 
                Choose from music, art, writing, or dance activities that push your creative boundaries.
              </p>
              <GlassCard className="p-4">
                <div className="flex items-center gap-3">
                  <Music className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-semibold">Example: Morning Melody</p>
                    <p className="text-sm text-muted-foreground">Create a 30-second uplifting tune in 10 minutes</p>
                  </div>
                </div>
              </GlassCard>
            </div>

            <div>
              <h3 className="text-xl font-display font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Focused Sessions
              </h3>
              <p className="text-muted-foreground mb-3">
                Each session includes warmup, focused creation time, and cooldown. 
                Track your progress with real-time audio/visual feedback and a built-in timer.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-display font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AI Feedback & Scoring
              </h3>
              <p className="text-muted-foreground mb-3">
                After each session, receive detailed AI analysis on creativity, technique, and adherence to the prompt. 
                See your scores visualized on a radar chart and get personalized improvement tips.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-display font-semibold mb-3 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                Streaks & Achievements
              </h3>
              <p className="text-muted-foreground mb-3">
                Build consistency with streak tracking and unlock achievements. 
                From your first session to week-long streaks, celebrate every milestone.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-display font-semibold mb-3 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Personal & Weekly Challenges
              </h3>
              <p className="text-muted-foreground mb-3">
                Beyond daily tasks, tackle week-long projects and create your own custom challenges 
                with personalized goals and timelines.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-display font-semibold mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Immersive 3D Environment
              </h3>
              <p className="text-muted-foreground mb-3">
                Practice in a beautiful, reactive 3D space that responds to your audio input. 
                Customize themes, intensity, and visual effects to match your creative mood.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
