import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import GlassCard from '@/components/GlassCard';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { useChallengeCompletion } from '@/hooks/useChallengeCompletion';
import { Play, Pause, StopCircle, Mic, RefreshCw, Sparkles, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Challenge() {
  const currentChallenge = useStore((state) => state.currentChallenge);
  const isRecording = useStore((state) => state.isRecording);
  const startRecording = useStore((state) => state.startRecording);
  const stopRecording = useStore((state) => state.stopRecording);
  const endChallenge = useStore((state) => state.endChallenge);
  const setAudioLevel = useStore((state) => state.setAudioLevel);
  const navigate = useNavigate();
  const { completeChallenge } = useChallengeCompletion();
  
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'warmup' | 'main' | 'cooldown'>('warmup');
  const [showFeedback, setShowFeedback] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();
  
  useEffect(() => {
    if (!currentChallenge) {
      navigate('/home');
      return;
    }
    setTimeLeft(currentChallenge.duration * 60);
  }, [currentChallenge, navigate]);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          const newTime = time - 1;
          
          // Phase transitions
          if (newTime === 480) setPhase('main'); // After 2min warmup
          if (newTime === 120) setPhase('cooldown'); // Last 2min
          if (newTime === 0) {
            setIsActive(false);
            setShowFeedback(true);
          }
          
          return newTime;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);
  
  const startAudioMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const updateLevel = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average / 255);
          animationFrameRef.current = requestAnimationFrame(updateLevel);
        }
      };
      
      updateLevel();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };
  
  const stopAudioMonitoring = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };
  
  const handleStart = () => {
    setIsActive(true);
    setPhase('warmup');
  };
  
  const handlePause = () => {
    setIsActive(false);
  };
  
  const handleRecord = async () => {
    if (!isRecording) {
      startRecording();
      await startAudioMonitoring();
    } else {
      stopRecording();
      stopAudioMonitoring();
    }
  };
  
  const handleEnd = async () => {
    setShowFeedback(true);
    setIsActive(false);
    if (isRecording) {
      stopRecording();
      stopAudioMonitoring();
    }
    
    // Calculate points based on time spent
    const totalTime = currentChallenge ? currentChallenge.duration * 60 : 600;
    const timeSpent = totalTime - timeLeft;
    const completionPercentage = (timeSpent / totalTime) * 100;
    
    // Award points based on completion percentage
    let earnedPoints = 0;
    if (currentChallenge) {
      const basePoints = currentChallenge.points || 50;
      if (completionPercentage >= 100) {
        earnedPoints = basePoints; // Full points for completing
      } else if (completionPercentage >= 75) {
        earnedPoints = Math.round(basePoints * 0.8);
      } else if (completionPercentage >= 50) {
        earnedPoints = Math.round(basePoints * 0.6);
      } else if (completionPercentage >= 25) {
        earnedPoints = Math.round(basePoints * 0.4);
      } else {
        earnedPoints = Math.round(basePoints * 0.2);
      }
    }
    
    setEarnedPoints(earnedPoints);
    
    // Mark challenge as completed
    if (currentChallenge) {
      const isPersonal = 'isPersonal' in currentChallenge && Boolean((currentChallenge as any).isPersonal);
      await completeChallenge(currentChallenge.id, earnedPoints, isPersonal);
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const phaseLabels = {
    warmup: { label: 'Warm Up', color: 'text-accent' },
    main: { label: 'Main Practice', color: 'text-primary' },
    cooldown: { label: 'Cool Down', color: 'text-secondary' },
  };
  
  if (!currentChallenge) return null;
  
  if (showFeedback) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <GlassCard className="text-center p-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-primary flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-primary-foreground" />
              </div>
              
              <h1 className="text-4xl font-display font-bold mb-4 text-primary">
                CHALLENGE COMPLETED! 🎉
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
                Great job! You earned <span className="text-primary font-bold">{earnedPoints} points</span>!
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                Your progress has been saved and achievements have been updated.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Creativity', score: 92 },
                  { label: 'Technique', score: 85 },
                  { label: 'Adherence', score: 88 },
                  { label: 'Overall', score: 89 },
                ].map((metric) => (
                  <div key={metric.label} className="glass p-4 rounded-xl">
                    <p className="text-3xl font-bold text-primary mb-1">
                      {metric.score}
                    </p>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                  </div>
                ))}
              </div>
              
              <div className="glass p-6 rounded-xl text-left mb-8">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  AI Feedback
                </h3>
                <p className="text-muted-foreground">
                  Excellent exploration of the theme! Your creative approach to the melody 
                  shows great understanding of harmonic progression. Consider varying the 
                  dynamics more in the middle section for added emotional impact.
                </p>
              </div>
              
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => {
                    endChallenge();
                    navigate('/home');
                  }}
                  className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
                >
                  Back to Home
                </Button>
                <Button variant="outline" className="glass">
                  View Recording
                </Button>
                <Button variant="outline" className="glass">
                  Share
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-4xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <Badge className="glass">
              {currentChallenge.category}
            </Badge>
            <Badge className={`${phaseLabels[phase].color} glass`}>
              {phaseLabels[phase].label}
            </Badge>
          </div>
          
          <h1 className="text-4xl font-display font-bold mb-2">
            {currentChallenge.title}
          </h1>
          <p className="text-lg text-muted-foreground">
            {currentChallenge.description}
          </p>
        </motion.div>
        
        <GlassCard className="text-center p-12">
          <div className="mb-8">
            <div className="relative inline-block">
              <div className="text-7xl font-bold font-display mb-2">
                {formatTime(timeLeft)}
              </div>
              <div className="absolute -inset-4 bg-gradient-primary opacity-20 blur-2xl rounded-full" />
            </div>
            <p className="text-muted-foreground">Time Remaining</p>
          </div>
          
          <div className="flex gap-4 justify-center mb-8">
            {!isActive ? (
              <Button
                size="lg"
                onClick={handleStart}
                className="bg-gradient-primary hover:opacity-90 text-primary-foreground px-8"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Session
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handlePause}
                  className="glass"
                >
                  <Pause className="w-5 h-5 mr-2" />
                  Pause
                </Button>
                <Button
                  size="lg"
                  variant={isRecording ? 'destructive' : 'default'}
                  onClick={handleRecord}
                  className={!isRecording ? 'bg-gradient-secondary text-white hover:opacity-90' : ''}
                >
                  <Mic className="w-5 h-5 mr-2" />
                  {isRecording ? 'Stop Recording' : 'Record'}
                </Button>
              </>
            )}
          </div>
          
          {isActive && (
            <div className="space-y-4">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-primary transition-all duration-1000"
                  style={{
                    width: `${((currentChallenge.duration * 60 - timeLeft) / (currentChallenge.duration * 60)) * 100}%`,
                  }}
                />
              </div>
              
              <Button
                variant="outline"
                onClick={handleEnd}
                className="glass"
              >
                <StopCircle className="w-4 h-4 mr-2" />
                End Session
              </Button>
            </div>
          )}
        </GlassCard>
        
        <GlassCard>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Creative Prompt
          </h3>
          <p className="text-muted-foreground mb-4">
            Try incorporating contrasting elements - loud vs. soft, fast vs. slow. 
            Let your intuition guide you, and don't be afraid to experiment!
          </p>
          <Button variant="ghost" size="sm" className="text-primary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Generate New Prompt
          </Button>
        </GlassCard>
      </div>
    </div>
  );
}
