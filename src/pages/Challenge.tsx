import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GlassCard from '@/components/GlassCard';
import { useStore } from '@/store/useStore';
import { useMusicStore } from '@/store/useMusicStore';
import { useNavigate } from 'react-router-dom';
import { useChallengeCompletion } from '@/hooks/useChallengeCompletion';
import { supabase } from '@/integrations/supabase/client';
import { Play, Pause, StopCircle, Mic, RefreshCw, Sparkles, Clock, Upload, FileAudio, FileVideo, FileText, X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

export default function Challenge() {
  const currentChallenge = useStore((state) => state.currentChallenge);
  const isRecording = useStore((state) => state.isRecording);
  const startRecording = useStore((state) => state.startRecording);
  const stopRecording = useStore((state) => state.stopRecording);
  const endChallenge = useStore((state) => state.endChallenge);
  const setAudioLevel = useStore((state) => state.setAudioLevel);
  const musicStop = useMusicStore((state) => state.stop);
  const isMusicPlaying = useMusicStore((state) => state.isPlaying);
  const navigate = useNavigate();
  const { completeChallenge } = useChallengeCompletion();
  
  const [timeLeft, setTimeLeft] = useState(600);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'warmup' | 'main' | 'cooldown'>('warmup');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [basePoints, setBasePoints] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
          if (newTime === 480) setPhase('main');
          if (newTime === 120) setPhase('cooldown');
          if (newTime === 0) {
            setIsActive(false);
            handleSessionEnd();
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
    // Stop background music when challenge starts
    if (isMusicPlaying) {
      musicStop();
      toast({
        title: 'Music paused',
        description: 'Background music stopped for your challenge focus',
      });
    }
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
  
  const handleSessionEnd = () => {
    setIsActive(false);
    if (isRecording) {
      stopRecording();
      stopAudioMonitoring();
    }
    
    // Calculate points based on time spent - MORE TIME = MORE POINTS
    const totalTime = currentChallenge ? currentChallenge.duration * 60 : 600;
    const timeSpent = totalTime - timeLeft;
    const percentage = Math.min((timeSpent / totalTime) * 100, 100);
    setCompletionPercentage(percentage);
    
    // Calculate base points based on completion percentage
    let points = 0;
    if (currentChallenge) {
      const challengePoints = currentChallenge.points || 50;
      
      if (percentage >= 100) {
        points = challengePoints; // Full points for completing
      } else if (percentage >= 90) {
        points = Math.round(challengePoints * 0.9);
      } else if (percentage >= 75) {
        points = Math.round(challengePoints * 0.75);
      } else if (percentage >= 50) {
        points = Math.round(challengePoints * 0.5);
      } else if (percentage >= 25) {
        points = Math.round(challengePoints * 0.3);
      } else if (percentage >= 10) {
        points = Math.round(challengePoints * 0.15);
      } else {
        points = Math.round(challengePoints * 0.05); // Minimal points for very short attempts
      }
    }
    
    setBasePoints(points);
    setEarnedPoints(points);
    setShowUploadModal(true);
  };
  
  const handleEnd = () => {
    handleSessionEnd();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['audio/mp3', 'audio/mpeg', 'video/mp4', 'application/pdf'];
      if (!validTypes.includes(file.type) && !file.name.endsWith('.mp3') && !file.name.endsWith('.mp4') && !file.name.endsWith('.pdf')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload MP3, MP4, or PDF files only',
          variant: 'destructive',
        });
        return;
      }
      
      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Maximum file size is 50MB',
          variant: 'destructive',
        });
        return;
      }
      
      setUploadedFile(file);
    }
  };
  
  const handleSkipUpload = async () => {
    setShowUploadModal(false);
    await finalizeChallenge(basePoints, null);
  };
  
  const handleUploadAndComplete = async () => {
    if (!uploadedFile || !currentChallenge) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: 'Error',
        description: 'Please log in to upload files',
        variant: 'destructive',
      });
      return;
    }
    
    setUploading(true);
    try {
      // Upload to Supabase storage with user ID in path for RLS
      const fileExt = uploadedFile.name.split('.').pop();
      const fileName = `${user.id}/submissions/${currentChallenge.id}_${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, uploadedFile);
      
      if (error) throw error;
      
      // Award bonus points for uploading (25% bonus)
      const bonusPoints = Math.round(basePoints * 0.25);
      const totalPoints = basePoints + bonusPoints;
      
      setEarnedPoints(totalPoints);
      setShowUploadModal(false);
      await finalizeChallenge(totalPoints, data?.path);
      
      toast({
        title: 'Work Uploaded!',
        description: `You earned ${bonusPoints} bonus points for uploading your work!`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload file. Completing without upload.',
        variant: 'destructive',
      });
      setShowUploadModal(false);
      await finalizeChallenge(basePoints, null);
    } finally {
      setUploading(false);
    }
  };
  
  const finalizeChallenge = async (points: number, submissionUrl: string | null) => {
    if (currentChallenge) {
      const isPersonal = 'isPersonal' in currentChallenge && Boolean((currentChallenge as any).isPersonal);
      await completeChallenge(currentChallenge.id, points, isPersonal);
    }
    setShowFeedback(true);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getFileIcon = (file: File) => {
    if (file.type.includes('audio') || file.name.endsWith('.mp3')) {
      return <FileAudio className="w-8 h-8 text-primary" />;
    }
    if (file.type.includes('video') || file.name.endsWith('.mp4')) {
      return <FileVideo className="w-8 h-8 text-primary" />;
    }
    return <FileText className="w-8 h-8 text-primary" />;
  };
  
  const phaseLabels = {
    warmup: { label: 'Warm Up', color: 'text-accent' },
    main: { label: 'Main Practice', color: 'text-primary' },
    cooldown: { label: 'Cool Down', color: 'text-secondary' },
  };
  
  if (!currentChallenge) return null;
  
  // Upload Modal
  if (showUploadModal) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <GlassCard className="text-center p-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-primary flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary-foreground" />
              </div>
              
              <h2 className="text-2xl font-display font-bold mb-2">
                Upload Your Work (Optional)
              </h2>
              <p className="text-muted-foreground mb-2">
                Share what you created and earn <span className="text-primary font-bold">25% bonus points!</span>
              </p>
              <div className="glass p-3 rounded-lg mb-6 text-sm">
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Supported formats:</span> MP3, MP4, PDF
                </p>
                <p className="text-destructive font-medium mt-1">
                  ⚠️ Maximum file size: 50MB - Do not exceed this limit
                </p>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Completion: {Math.round(completionPercentage)}%</span>
                  <span>Base Points: {basePoints}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-primary transition-all"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp3,.mp4,.pdf,audio/mpeg,video/mp4,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {!uploadedFile ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-8 mb-6 cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Click to select a file</p>
                </div>
              ) : (
                <div className="glass p-4 rounded-xl mb-6 flex items-center gap-4">
                  {getFileIcon(uploadedFile)}
                  <div className="flex-1 text-left">
                    <p className="font-medium truncate">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setUploadedFile(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              
              {uploadedFile && (
                <div className="glass p-3 rounded-lg mb-6 text-sm">
                  <p className="text-primary font-medium">
                    +{Math.round(basePoints * 0.25)} bonus points for uploading!
                  </p>
                  <p className="text-muted-foreground">
                    Total: {basePoints + Math.round(basePoints * 0.25)} points
                  </p>
                </div>
              )}
              
              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={handleSkipUpload}
                  className="glass"
                  disabled={uploading}
                >
                  Skip & Complete
                </Button>
                <Button
                  onClick={handleUploadAndComplete}
                  disabled={!uploadedFile || uploading}
                  className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
                >
                  {uploading ? 'Uploading...' : 'Upload & Complete'}
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    );
  }
  
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
                <CheckCircle className="w-10 h-10 text-primary-foreground" />
              </div>
              
              <h1 className="text-4xl font-display font-bold mb-4 text-primary">
                CHALLENGE COMPLETED! 🎉
              </h1>
              <p className="text-lg text-muted-foreground mb-2">
                Great job! You earned <span className="text-primary font-bold">{earnedPoints} points</span>!
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                {Math.round(completionPercentage)}% completion • Your progress has been saved
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Time', score: `${Math.round(completionPercentage)}%` },
                  { label: 'Points', score: earnedPoints },
                  { label: 'Difficulty', score: currentChallenge.difficulty },
                  { label: 'Category', score: currentChallenge.category },
                ].map((metric) => (
                  <div key={metric.label} className="glass p-4 rounded-xl">
                    <p className="text-2xl font-bold text-primary mb-1">
                      {metric.score}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">{metric.label}</p>
                  </div>
                ))}
              </div>
              
              <div className="glass p-6 rounded-xl text-left mb-8">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Session Summary
                </h3>
                <p className="text-muted-foreground">
                  {completionPercentage >= 90 
                    ? "Outstanding dedication! You completed nearly the entire session. Keep up this amazing work!"
                    : completionPercentage >= 75
                    ? "Great effort! You showed strong commitment to your practice."
                    : completionPercentage >= 50
                    ? "Good progress! Try to stay a bit longer next time for more points."
                    : "Every practice counts! Try to spend more time to earn more points."}
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
                <Button 
                  variant="outline" 
                  className="glass"
                  onClick={() => {
                    endChallenge();
                    navigate('/achievements');
                  }}
                >
                  View Achievements
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
          <div className="mb-4">
            <Badge variant="outline" className="glass mb-4">
              <Clock className="w-4 h-4 mr-1" />
              {currentChallenge.points} points available
            </Badge>
          </div>
          
          <div className="mb-8">
            <div className="relative inline-block">
              <div className="text-7xl font-bold font-display mb-2">
                {formatTime(timeLeft)}
              </div>
              <div className="absolute -inset-4 bg-gradient-primary opacity-20 blur-2xl rounded-full" />
            </div>
            <p className="text-muted-foreground">Time Remaining</p>
            <p className="text-xs text-muted-foreground mt-1">
              Complete more time for more points!
            </p>
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