import PageBackground from '@/components/PageBackground';
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 max-w-5xl mx-auto px-2">
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
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleHobby(hobby.id)}
                  className={`relative ob-option cursor-pointer aspect-square flex flex-col items-center justify-center gap-2 p-3 ${
                    isSelected ? 'ob-selected' : ''
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
                        className="absolute top-2 right-2 w-5 h-5 rounded-full ob-check flex items-center justify-center "
                      >
                        <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    isSelected ? 'ob-icon-sel' : 'ob-icon'
                  }`}>
                    <IconComponent className={`w-6 h-6 transition-colors duration-200 ${
                      isSelected ? 'ob-accent' : 'ob-ink'
                    }`} />
                  </div>
                  <span className={`font-medium text-xs sm:text-sm text-center leading-tight transition-colors duration-200 line-clamp-2 ${
                    isSelected ? 'ob-accent' : 'ob-ink'
                  }`}>
                    {hobby.name}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {selectedHobbies.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-2 justify-center max-w-3xl mx-auto"
            >
              <span className="text-sm ob-muted mr-2 self-center">
                Selected ({selectedHobbies.length}):
              </span>
              {selectedHobbies.map((hobbyId) => {
                const hobby = hobbies.find(h => h.id === hobbyId);
                return (
                  <Badge key={hobbyId} variant="secondary" className="ob-chip">
                    {hobby?.name}
                  </Badge>
                );
              })}
            </motion.div>
          )}
        </div>
      ),
    },
    {
      title: "How are you feeling today?",
      subtitle: "We'll match your session to your mood",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {moods.map((mood) => {
            const isSelected = selectedMood === mood.id;
            return (
              <motion.div
                key={mood.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedMood(mood.id)}
                className={`relative ob-option p-6 text-center cursor-pointer ${
                  isSelected ? 'ob-selected' : ''
                }`}
              >
                {/* Animated Checkmark */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="absolute top-3 right-3 w-6 h-6 rounded-full ob-check flex items-center justify-center "
                    >
                      <Check className="w-4 h-4 text-primary-foreground" strokeWidth={3} />
                    </motion.div>
                  )}
                </AnimatePresence>
                <mood.icon className={`w-10 h-10 mx-auto mb-3 transition-colors ${isSelected ? 'ob-accent' : 'ob-ink'}`} />
                <h3 className={`font-semibold transition-colors ${isSelected ? 'ob-accent' : 'ob-ink'}`}>{mood.label}</h3>
              </motion.div>
            );
          })}
        </div>
      ),
    },
    {
      title: "Choose your session length",
      subtitle: "Start small, build your creative muscle",
      content: (
        <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
          {[
            { value: 10 as const, label: '10 min', desc: 'Quick & Focused' },
            { value: 15 as const, label: '15 min', desc: 'Deep Dive' }
          ].map((option) => {
            const isSelected = sessionLength === option.value;
            return (
              <motion.div
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSessionLength(option.value)}
                className={`relative ob-option p-8 text-center cursor-pointer ${
                  isSelected ? 'ob-selected' : ''
                }`}
              >
                {/* Animated Checkmark */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="absolute top-3 right-3 w-6 h-6 rounded-full ob-check flex items-center justify-center "
                    >
                      <Check className="w-4 h-4 text-primary-foreground" strokeWidth={3} />
                    </motion.div>
                  )}
                </AnimatePresence>
                <Clock className={`w-12 h-12 mx-auto mb-4 transition-colors ${isSelected ? 'ob-accent' : 'ob-ink'}`} />
                <h3 className={`font-bold text-3xl mb-2 transition-colors ${isSelected ? 'ob-accent' : 'ob-ink'}`}>{option.label}</h3>
                <p className="text-sm ob-muted">{option.desc}</p>
              </motion.div>
            );
          })}
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
    <div className="ob-page min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
      <PageBackground src="/landing-bg.png" />
      <div className="ob-card w-full max-w-4xl mx-auto relative z-10 px-5 py-8 md:px-12 md:py-12">
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
                    ? 'w-12 ob-step-on'
                    : index < step
                    ? 'w-8 ob-step-done'
                    : 'w-8 ob-step-off'
                }`}
              />
            ))}
          </div>
          <h1 className="ob-h1 mb-3">
            {currentStep.title}
          </h1>
          <p className="ob-sub text-base md:text-lg">{currentStep.subtitle}</p>
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
              className="ob-btn-outline"
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
            className="ob-btn px-8"
          >
            {loading ? 'Setting up...' : step === steps.length - 1 ? "Let's Create!" : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
