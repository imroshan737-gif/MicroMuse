import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music, Palette, PenTool, Sparkles, Heart, Zap, Clock, Plus,
  Guitar, Mic, Piano, Camera, Scissors, Book, Theater, Code,
  Dumbbell, Coffee
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import GlassCard from '@/components/GlassCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const categories = [
  { id: 'music', name: 'Music', icon: Music, color: 'text-primary' },
  { id: 'art', name: 'Visual Art', icon: Palette, color: 'text-secondary' },
  { id: 'writing', name: 'Writing', icon: PenTool, color: 'text-accent' },
  { id: 'dance', name: 'Dance', icon: Sparkles, color: 'text-primary' },
  { id: 'guitar', name: 'Guitar', icon: Guitar, color: 'text-primary' },
  { id: 'singing', name: 'Singing', icon: Mic, color: 'text-accent' },
  { id: 'piano', name: 'Piano', icon: Piano, color: 'text-primary' },
  { id: 'photography', name: 'Photography', icon: Camera, color: 'text-secondary' },
  { id: 'video', name: 'Video Editing', icon: Scissors, color: 'text-accent' },
  { id: 'poetry', name: 'Poetry', icon: Book, color: 'text-primary' },
  { id: 'acting', name: 'Acting', icon: Theater, color: 'text-secondary' },
  { id: 'coding', name: 'Creative Coding', icon: Code, color: 'text-accent' },
  { id: 'fitness', name: 'Fitness & Yoga', icon: Dumbbell, color: 'text-primary' },
  { id: 'cooking', name: 'Cooking', icon: Coffee, color: 'text-secondary' },
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
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherInterest, setOtherInterest] = useState('');
  const navigate = useNavigate();
  const setUser = useStore((state) => state.setUser);
  
  const toggleInterest = (id: string) => {
    if (id === 'other') {
      setShowOtherInput(!showOtherInput);
      return;
    }
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const addOtherInterest = () => {
    if (otherInterest.trim()) {
      setSelectedInterests((prev) => [...prev, otherInterest.trim()]);
      setOtherInterest('');
      setShowOtherInput(false);
    }
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
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 max-w-5xl mx-auto">
            {categories.map((category) => (
              <GlassCard
                key={category.id}
                hover
                onClick={() => toggleInterest(category.id)}
                className={`p-4 text-center cursor-pointer ${
                  selectedInterests.includes(category.id)
                    ? 'ring-2 ring-primary shadow-glow-primary'
                    : ''
                }`}
              >
                <category.icon className={`w-8 h-8 mx-auto mb-2 ${category.color}`} />
                <h3 className="font-display font-semibold text-sm">{category.name}</h3>
              </GlassCard>
            ))}
            
            <GlassCard
              hover
              onClick={() => toggleInterest('other')}
              className="p-4 text-center cursor-pointer"
            >
              <Plus className="w-8 h-8 mx-auto mb-2 text-accent" />
              <h3 className="font-display font-semibold text-sm">Other</h3>
            </GlassCard>
          </div>
          
          {showOtherInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="max-w-md mx-auto space-y-3"
            >
              <Label htmlFor="other-interest" className="text-center block">
                Enter your creative interest
              </Label>
              <div className="flex gap-2">
                <Input
                  id="other-interest"
                  placeholder="e.g., Origami, Calligraphy, Gardening..."
                  value={otherInterest}
                  onChange={(e) => setOtherInterest(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addOtherInterest()}
                  className="glass"
                />
                <Button 
                  onClick={addOtherInterest}
                  className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
                >
                  Add
                </Button>
              </div>
            </motion.div>
          )}
          
          {selectedInterests.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center max-w-3xl mx-auto">
              {selectedInterests.map((interest) => (
                <Badge key={interest} variant="secondary" className="glass">
                  {categories.find(c => c.id === interest)?.name || interest}
                </Badge>
              ))}
            </div>
          )}
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
