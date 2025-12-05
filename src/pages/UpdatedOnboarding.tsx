import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music, Palette, PenTool, Sparkles, Heart, Zap, Clock, Plus,
  Code, Camera, Dumbbell, Coffee, Gamepad2, Scissors, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import GlassCard from '@/components/GlassCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

const moods = [
  { id: 'energized', label: 'Energized', icon: Zap },
  { id: 'calm', label: 'Calm & Focused', icon: Heart },
  { id: 'playful', label: 'Playful', icon: Sparkles },
];

export default function UpdatedOnboarding() {
  const [step, setStep] = useState(0);
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [sessionLength, setSessionLength] = useState<10 | 15>(10);
  const [hobbies, setHobbies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchHobbies();
  }, []);

  const fetchHobbies = async () => {
    const { data } = await supabase
      .from('hobbies')
      .select('*')
      .order('popularity_count', { ascending: false });

    if (data) {
      setHobbies(data);
    }
  };

  const toggleHobby = (hobbyId: string) => {
    setSelectedHobbies((prev) =>
      prev.includes(hobbyId)
        ? prev.filter((id) => id !== hobbyId)
        : [...prev, hobbyId]
    );
  };

  const completeOnboarding = async () => {
    if (!user) return;

    setLoading(true);

    // Save selected hobbies
    const hobbyInserts = selectedHobbies.map((hobbyId, index) => ({
      user_id: user.id,
      hobby_id: hobbyId,
      display_order: index,
    }));

    await supabase.from('user_hobbies').insert(hobbyInserts);

    // Update profile with mood
    await supabase
      .from('profiles')
      .update({ mood: selectedMood })
      .eq('id', user.id);

    toast({
      title: 'Welcome!',
      description: 'Your profile has been set up successfully.',
    });

    setLoading(false);
    navigate('/home');
  };

  const steps = [
    {
      title: "What sparks your creativity?",
      subtitle: "Select all that interest you",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 max-w-5xl mx-auto">
            {hobbies.map((hobby) => {
              const iconMap: any = {
                Music, Palette, PenTool, Code, Camera,
                Dumbbell, Coffee, Gamepad2, Scissors, Sparkles
              };
              const IconComponent = iconMap[hobby.icon] || Sparkles;

              const isSelected = selectedHobbies.includes(hobby.id);

              return (
                <motion.div
                  key={hobby.id}
                  whileTap={{ scale: 0.95 }}
                  animate={{ scale: isSelected ? 1.02 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <GlassCard
                    hover
                    onClick={() => toggleHobby(hobby.id)}
                    className={`p-4 text-center cursor-pointer relative transition-all duration-300 ${
                      isSelected
                        ? 'ring-2 ring-primary shadow-glow-primary bg-primary/20 border-primary/50'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    {/* Checkmark indicator */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg"
                        >
                          <Check className="w-4 h-4 text-primary-foreground" strokeWidth={3} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isSelected 
                          ? 'bg-primary/20 shadow-md' 
                          : 'bg-muted/30'
                      }`}>
                        <IconComponent className={`w-7 h-7 transition-colors duration-300 ${
                          isSelected ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <h3 className={`font-display font-semibold text-sm transition-colors duration-300 ${
                        isSelected ? 'text-primary' : 'text-foreground'
                      }`}>
                        {hobby.emoji} {hobby.name}
                      </h3>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>

          {selectedHobbies.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center max-w-3xl mx-auto">
              {selectedHobbies.map((hobbyId) => {
                const hobby = hobbies.find(h => h.id === hobbyId);
                return (
                  <Badge key={hobbyId} variant="secondary" className="glass">
                    {hobby?.emoji} {hobby?.name}
                  </Badge>
                );
              })}
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
              className={`p-6 text-center cursor-pointer ${
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
            className={`p-8 text-center cursor-pointer ${
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
            className={`p-8 text-center cursor-pointer ${
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
    (step === 0 && selectedHobbies.length > 0) ||
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
              disabled={loading}
            >
              Back
            </Button>
          )}
          <Button
            size="lg"
            onClick={() =>
              step === steps.length - 1 ? completeOnboarding() : setStep(step + 1)
            }
            disabled={!canProceed || loading}
            className="bg-gradient-primary hover:opacity-90 text-primary-foreground px-8"
          >
            {loading ? 'Setting up...' : step === steps.length - 1 ? "Let's Create!" : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
