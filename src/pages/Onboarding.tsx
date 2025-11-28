import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Palette, PenTool, Sparkles, Heart, Zap, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import GlassCard from '@/components/GlassCard';

const categories = [
  { id: 'music', name: 'Music', icon: Music, color: 'text-primary' },
  { id: 'art', name: 'Visual Art', icon: Palette, color: 'text-secondary' },
  { id: 'writing', name: 'Writing', icon: PenTool, color: 'text-accent' },
  { id: 'dance', name: 'Dance', icon: Sparkles, color: 'text-primary' },
];

const moods = [
  { id: 'energized', label: 'Energized', icon: Zap },
  { id: 'calm', label: 'Calm & Focused', icon: Heart },
  { id: 'playful', label: 'Playful', icon: Sparkles },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [sessionLength, setSessionLength] = useState<10 | 15>(10);
  const navigate = useNavigate();
  const setUser = useStore((state) => state.setUser);
  
  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };
  
  const completeOnboarding = () => {
    setUser({
      id: 'demo-user',
      name: 'Creative Explorer',
      email: 'explorer@micromuse.app',
      streak: 0,
      totalSessions: 0,
      badges: [],
      interests: selectedInterests,
      instruments: [],
    });
    navigate('/home');
  };
  
  const steps = [
    {
      title: "What sparks your creativity?",
      subtitle: "Select all that interest you",
      content: (
        <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
          {categories.map((category) => (
            <GlassCard
              key={category.id}
              hover
              onClick={() => toggleInterest(category.id)}
              className={`p-8 text-center ${
                selectedInterests.includes(category.id)
                  ? 'ring-2 ring-primary shadow-glow-primary'
                  : ''
              }`}
            >
              <category.icon className={`w-12 h-12 mx-auto mb-4 ${category.color}`} />
              <h3 className="font-display font-semibold text-lg">{category.name}</h3>
            </GlassCard>
          ))}
        </div>
      ),
    },
    {
      title: "How are you feeling today?",
      subtitle: "We'll match your session to your mood",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {moods.map((mood) => (
            <GlassCard
              key={mood.id}
              hover
              onClick={() => setSelectedMood(mood.id)}
              className={`p-6 text-center ${
                selectedMood === mood.id ? 'ring-2 ring-primary shadow-glow-primary' : ''
              }`}
            >
              <mood.icon className="w-10 h-10 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold">{mood.label}</h3>
            </GlassCard>
          ))}
        </div>
      ),
    },
    {
      title: "Choose your session length",
      subtitle: "Start small, build your creative muscle",
      content: (
        <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
          <GlassCard
            hover
            onClick={() => setSessionLength(10)}
            className={`p-8 text-center ${
              sessionLength === 10 ? 'ring-2 ring-primary shadow-glow-primary' : ''
            }`}
          >
            <Clock className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="font-display font-bold text-3xl mb-2">10 min</h3>
            <p className="text-sm text-muted-foreground">Quick & Focused</p>
          </GlassCard>
          <GlassCard
            hover
            onClick={() => setSessionLength(15)}
            className={`p-8 text-center ${
              sessionLength === 15 ? 'ring-2 ring-primary shadow-glow-primary' : ''
            }`}
          >
            <Clock className="w-12 h-12 mx-auto mb-4 text-secondary" />
            <h3 className="font-display font-bold text-3xl mb-2">15 min</h3>
            <p className="text-sm text-muted-foreground">Deep Dive</p>
          </GlassCard>
        </div>
      ),
    },
  ];
  
  const currentStep = steps[step];
  const canProceed =
    (step === 0 && selectedInterests.length > 0) ||
    (step === 1 && selectedMood !== '') ||
    step === 2;
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === step
                    ? 'w-12 bg-gradient-primary'
                    : index < step
                    ? 'w-8 bg-primary/50'
                    : 'w-8 bg-muted'
                }`}
              />
            ))}
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">
            {currentStep.title}
          </h1>
          <p className="text-lg text-muted-foreground">{currentStep.subtitle}</p>
        </motion.div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-12"
          >
            {currentStep.content}
          </motion.div>
        </AnimatePresence>
        
        <div className="flex justify-center gap-4">
          {step > 0 && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep(step - 1)}
              className="glass"
            >
              Back
            </Button>
          )}
          <Button
            size="lg"
            onClick={() =>
              step === steps.length - 1 ? completeOnboarding() : setStep(step + 1)
            }
            disabled={!canProceed}
            className="bg-gradient-primary hover:opacity-90 text-primary-foreground px-8"
          >
            {step === steps.length - 1 ? "Let's Create!" : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
