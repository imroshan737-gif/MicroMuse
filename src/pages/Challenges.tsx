import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import GlassCard from '@/components/GlassCard';
import { Clock, Trophy, Target, Play, Plus, Calendar, Music, Palette, PenTool, Zap, CheckCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useChallenges } from '@/hooks/useChallenges';
import { toast } from '@/hooks/use-toast';

// Fallback challenges when database is empty or for additional variety
const defaultDailyChallenges = [
  // Music challenges
  { id: 'd1', title: 'Morning Melody Maker', description: 'Compose a cheerful 30-second tune to kickstart your day', category: 'music' as const, duration: 10, difficulty: 'beginner' as const, points: 50, icon: Music },
  { id: 'd2', title: 'Harmony Builder', description: 'Create a 4-chord progression and explore variations', category: 'music' as const, duration: 15, difficulty: 'moderate' as const, points: 75, icon: Music },
  { id: 'd3', title: 'Beat Master', description: 'Design a unique drum pattern with syncopation', category: 'music' as const, duration: 12, difficulty: 'expert' as const, points: 100, icon: Music },
  
  // Art challenges
  { id: 'd4', title: 'Color Emotion Study', description: 'Paint a feeling using only warm colors', category: 'art' as const, duration: 15, difficulty: 'beginner' as const, points: 75, icon: Palette },
  { id: 'd5', title: 'Abstract Expression', description: 'Create an abstract piece inspired by nature', category: 'art' as const, duration: 20, difficulty: 'moderate' as const, points: 90, icon: Palette },
  { id: 'd6', title: 'Portrait Challenge', description: 'Sketch a detailed portrait from imagination', category: 'art' as const, duration: 25, difficulty: 'expert' as const, points: 120, icon: Palette },
  
  // Writing challenges
  { id: 'd7', title: 'Flash Fiction', description: 'Write a complete story in exactly 50 words', category: 'writing' as const, duration: 10, difficulty: 'beginner' as const, points: 60, icon: PenTool },
  { id: 'd8', title: 'Character Development', description: 'Create a detailed character profile with backstory', category: 'writing' as const, duration: 15, difficulty: 'moderate' as const, points: 80, icon: PenTool },
  { id: 'd9', title: 'Plot Twist Master', description: 'Write a 200-word story with an unexpected ending', category: 'writing' as const, duration: 18, difficulty: 'expert' as const, points: 110, icon: PenTool },
  
  // Dance challenges
  { id: 'd10', title: 'Rhythm Express', description: 'Create a 20-second dance expressing joy', category: 'dance' as const, duration: 10, difficulty: 'beginner' as const, points: 50, icon: Zap },
  { id: 'd11', title: 'Freestyle Flow', description: 'Choreograph a 1-minute routine to your favorite song', category: 'dance' as const, duration: 15, difficulty: 'moderate' as const, points: 85, icon: Zap },
  { id: 'd12', title: 'Contemporary Fusion', description: 'Blend two dance styles into one routine', category: 'dance' as const, duration: 20, difficulty: 'expert' as const, points: 115, icon: Zap },
  
  // Coding challenges
  { id: 'd13', title: 'Algorithm Basics', description: 'Solve a simple sorting algorithm problem', category: 'coding' as const, duration: 15, difficulty: 'beginner' as const, points: 70, icon: Zap },
  { id: 'd14', title: 'API Integration', description: 'Build a mini app that fetches and displays data', category: 'coding' as const, duration: 20, difficulty: 'moderate' as const, points: 95, icon: Zap },
  { id: 'd15', title: 'System Design', description: 'Design a scalable architecture for a chat app', category: 'coding' as const, duration: 25, difficulty: 'expert' as const, points: 130, icon: Zap },
  
  // Photography challenges
  { id: 'd16', title: 'Golden Hour Capture', description: 'Take 5 photos during sunrise or sunset', category: 'photography' as const, duration: 10, difficulty: 'beginner' as const, points: 55, icon: Palette },
  { id: 'd17', title: 'Macro World', description: 'Capture intricate details of small objects', category: 'photography' as const, duration: 15, difficulty: 'moderate' as const, points: 80, icon: Palette },
  { id: 'd18', title: 'Portrait Mastery', description: 'Create a professional portrait with lighting', category: 'photography' as const, duration: 20, difficulty: 'expert' as const, points: 105, icon: Palette },
  
  // Fitness challenges
  { id: 'd19', title: 'Morning Energy Boost', description: 'Complete a 10-minute cardio workout', category: 'fitness' as const, duration: 10, difficulty: 'beginner' as const, points: 50, icon: Zap },
  { id: 'd20', title: 'Core Strength Builder', description: 'Perform targeted ab exercises for 15 minutes', category: 'fitness' as const, duration: 15, difficulty: 'moderate' as const, points: 75, icon: Zap },
  { id: 'd21', title: 'HIIT Intensity', description: 'Complete a high-intensity interval training session', category: 'fitness' as const, duration: 20, difficulty: 'expert' as const, points: 100, icon: Zap },
  
  // Cooking challenges
  { id: 'd22', title: 'Quick Breakfast', description: 'Prepare a healthy breakfast in 10 minutes', category: 'cooking' as const, duration: 10, difficulty: 'beginner' as const, points: 55, icon: Palette },
  { id: 'd23', title: 'International Dish', description: 'Cook a recipe from a cuisine you\'ve never tried', category: 'cooking' as const, duration: 25, difficulty: 'moderate' as const, points: 90, icon: Palette },
  { id: 'd24', title: 'Gourmet Challenge', description: 'Create a restaurant-quality 3-course meal', category: 'cooking' as const, duration: 30, difficulty: 'expert' as const, points: 125, icon: Palette },
  
  // Gaming challenges
  { id: 'd25', title: 'Speed Run Practice', description: 'Complete a game level as fast as possible', category: 'gaming' as const, duration: 15, difficulty: 'beginner' as const, points: 60, icon: Zap },
  { id: 'd26', title: 'Strategy Master', description: 'Win a match using an unconventional strategy', category: 'gaming' as const, duration: 20, difficulty: 'moderate' as const, points: 85, icon: Zap },
  { id: 'd27', title: 'Tournament Ready', description: 'Achieve a personal best score in competitive mode', category: 'gaming' as const, duration: 25, difficulty: 'expert' as const, points: 110, icon: Zap },
  
  // Design challenges
  { id: 'd28', title: 'Logo Concept', description: 'Design a minimal logo for a fictional brand', category: 'design' as const, duration: 15, difficulty: 'beginner' as const, points: 65, icon: Palette },
  { id: 'd29', title: 'UI Component', description: 'Create a complete user interface component set', category: 'design' as const, duration: 20, difficulty: 'moderate' as const, points: 90, icon: Palette },
  { id: 'd30', title: 'Brand Identity', description: 'Design a full brand identity system with guidelines', category: 'design' as const, duration: 30, difficulty: 'expert' as const, points: 135, icon: Palette },
];

const defaultWeeklyChallenges = [
  // Music
  { id: 'w1', title: 'Symphony Builder', description: 'Create a full 2-minute composition across 7 days', category: 'music' as const, totalDays: 7, currentDay: 0, difficulty: 'expert' as const, points: 500, icon: Music, duration: 30 },
  { id: 'w2', title: 'Album Project', description: 'Produce 5 different tracks exploring various genres', category: 'music' as const, totalDays: 7, currentDay: 0, difficulty: 'moderate' as const, points: 400, icon: Music, duration: 25 },
  
  // Art
  { id: 'w3', title: 'Masterpiece Journey', description: 'Complete a detailed artwork through daily progress', category: 'art' as const, totalDays: 7, currentDay: 0, difficulty: 'expert' as const, points: 600, icon: Palette, duration: 30 },
  { id: 'w4', title: 'Style Evolution', description: 'Create one piece each day in a different art style', category: 'art' as const, totalDays: 7, currentDay: 0, difficulty: 'moderate' as const, points: 450, icon: Palette, duration: 20 },
  
  // Writing
  { id: 'w5', title: 'Short Story Saga', description: 'Write a 1000-word story, 150 words per day', category: 'writing' as const, totalDays: 7, currentDay: 0, difficulty: 'moderate' as const, points: 450, icon: PenTool, duration: 20 },
  { id: 'w6', title: 'Novel Chapter', description: 'Complete a full chapter of a novel across the week', category: 'writing' as const, totalDays: 7, currentDay: 0, difficulty: 'expert' as const, points: 550, icon: PenTool, duration: 30 },
  
  // Dance
  { id: 'w7', title: 'Choreography Collection', description: 'Create a complete dance routine by adding daily', category: 'dance' as const, totalDays: 7, currentDay: 0, difficulty: 'moderate' as const, points: 420, icon: Zap, duration: 20 },
  { id: 'w8', title: 'Performance Ready', description: 'Master a complex routine for stage performance', category: 'dance' as const, totalDays: 7, currentDay: 0, difficulty: 'expert' as const, points: 520, icon: Zap, duration: 30 },
  
  // Coding
  { id: 'w9', title: 'Full Stack App', description: 'Build a complete web application from scratch', category: 'coding' as const, totalDays: 7, currentDay: 0, difficulty: 'expert' as const, points: 650, icon: Zap, duration: 45 },
  { id: 'w10', title: 'Algorithm Marathon', description: 'Solve different algorithm challenges each day', category: 'coding' as const, totalDays: 7, currentDay: 0, difficulty: 'moderate' as const, points: 480, icon: Zap, duration: 30 },
  
  // Photography
  { id: 'w11', title: 'Photo Series', description: 'Create a cohesive series telling a visual story', category: 'photography' as const, totalDays: 7, currentDay: 0, difficulty: 'moderate' as const, points: 430, icon: Palette, duration: 25 },
  { id: 'w12', title: 'Master Techniques', description: 'Practice a different advanced technique each day', category: 'photography' as const, totalDays: 7, currentDay: 0, difficulty: 'expert' as const, points: 530, icon: Palette, duration: 30 },
  
  // Fitness
  { id: 'w13', title: '7-Day Transformation', description: 'Complete progressive workouts building strength', category: 'fitness' as const, totalDays: 7, currentDay: 0, difficulty: 'moderate' as const, points: 410, icon: Zap, duration: 30 },
  { id: 'w14', title: 'Athletic Challenge', description: 'Train like an athlete with intense daily sessions', category: 'fitness' as const, totalDays: 7, currentDay: 0, difficulty: 'expert' as const, points: 510, icon: Zap, duration: 45 },
  
  // Cooking
  { id: 'w15', title: 'Culinary World Tour', description: 'Cook dishes from 7 different countries', category: 'cooking' as const, totalDays: 7, currentDay: 0, difficulty: 'moderate' as const, points: 470, icon: Palette, duration: 40 },
  { id: 'w16', title: 'Master Chef Journey', description: 'Perfect advanced cooking techniques daily', category: 'cooking' as const, totalDays: 7, currentDay: 0, difficulty: 'expert' as const, points: 580, icon: Palette, duration: 50 },
  
  // Gaming
  { id: 'w17', title: 'Skill Mastery', description: 'Improve rank through focused practice sessions', category: 'gaming' as const, totalDays: 7, currentDay: 0, difficulty: 'moderate' as const, points: 440, icon: Zap, duration: 30 },
  { id: 'w18', title: 'Pro Tournament Prep', description: 'Train for competitive esports readiness', category: 'gaming' as const, totalDays: 7, currentDay: 0, difficulty: 'expert' as const, points: 540, icon: Zap, duration: 45 },
  
  // Design
  { id: 'w19', title: 'Design System', description: 'Create a complete design system from scratch', category: 'design' as const, totalDays: 7, currentDay: 0, difficulty: 'expert' as const, points: 620, icon: Palette, duration: 40 },
  { id: 'w20', title: 'Portfolio Expansion', description: 'Add one polished project to portfolio daily', category: 'design' as const, totalDays: 7, currentDay: 0, difficulty: 'moderate' as const, points: 460, icon: Palette, duration: 35 },
];

const categoryColors: Record<string, string> = {
  music: 'bg-primary/10 text-primary border-primary/20',
  art: 'bg-secondary/10 text-secondary border-secondary/20',
  writing: 'bg-accent/10 text-accent border-accent/20',
  dance: 'bg-primary/10 text-primary border-primary/20',
  coding: 'bg-secondary/10 text-secondary border-secondary/20',
  photography: 'bg-accent/10 text-accent border-accent/20',
  fitness: 'bg-primary/10 text-primary border-primary/20',
  cooking: 'bg-secondary/10 text-secondary border-secondary/20',
  gaming: 'bg-accent/10 text-accent border-accent/20',
  design: 'bg-primary/10 text-primary border-primary/20',
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'music': return Music;
    case 'art': return Palette;
    case 'writing': return PenTool;
    case 'dance': return Zap;
    case 'coding': return Zap;
    case 'photography': return Palette;
    case 'fitness': return Zap;
    case 'cooking': return Palette;
    case 'gaming': return Zap;
    case 'design': return Palette;
    default: return Target;
  }
};

export default function Challenges() {
  const navigate = useNavigate();
  const startChallenge = useStore((state) => state.startChallenge);
  const { 
    dailyChallenges: dbDailyChallenges, 
    weeklyChallenges: dbWeeklyChallenges, 
    personalChallenges,
    completedChallengeIds,
    loading,
    createPersonalChallenge 
  } = useChallenges();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    category: 'music',
    duration: 10,
  });

  // Combine database challenges with defaults (filtering out completed)
  const filteredDailyChallenges = [
    ...dbDailyChallenges,
    ...defaultDailyChallenges.filter(c => !completedChallengeIds.includes(c.id))
  ];

  const filteredWeeklyChallenges = [
    ...dbWeeklyChallenges,
    ...defaultWeeklyChallenges.filter(c => !completedChallengeIds.includes(c.id))
  ];

  const handleStartChallenge = (challenge: any) => {
    const transformedChallenge = {
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      category: challenge.category,
      duration: challenge.duration || challenge.totalDays || 10,
      difficulty: challenge.difficulty,
      points: challenge.points,
      isPersonal: challenge.type === 'personal' || challenge.isPersonal,
    };
    startChallenge(transformedChallenge);
    navigate('/challenge');
  };

  const handleCreatePersonalChallenge = async () => {
    if (!newChallenge.title || !newChallenge.description) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    const result = await createPersonalChallenge(newChallenge);
    if (result) {
      toast({
        title: 'Challenge Created!',
        description: 'Your personal challenge is ready to start',
      });
      setDialogOpen(false);
      setNewChallenge({ title: '', description: '', category: 'music', duration: 10 });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to create challenge. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-2">
            Challenges
          </h1>
          <p className="text-lg text-muted-foreground">
            Push your creative boundaries with daily, weekly, and personal challenges
          </p>
        </motion.div>

        <Tabs defaultValue="daily" className="space-y-8">
          <TabsList className="glass-strong">
            <TabsTrigger value="daily">Daily Challenges</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Challenges</TabsTrigger>
            <TabsTrigger value="personal">Personal Challenges</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-6">
            {filteredDailyChallenges.length === 0 ? (
              <GlassCard className="text-center py-12">
                <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-display font-semibold mb-2">
                  No challenges match your hobbies
                </h3>
                <p className="text-muted-foreground">
                  Update your hobbies in profile settings to see relevant challenges
                </p>
              </GlassCard>
            ) : (
              <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredDailyChallenges.map((challenge, index) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard hover className="h-full">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                        <challenge.icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={categoryColors[challenge.category]}>
                            {challenge.category}
                          </Badge>
                          <Badge variant="outline" className="glass">
                            {challenge.difficulty}
                          </Badge>
                        </div>
                        <h3 className="text-xl font-display font-semibold mb-1">
                          {challenge.title}
                        </h3>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-4">
                      {challenge.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{challenge.duration} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4 text-primary" />
                          <span className="text-primary font-semibold">{challenge.points} pts</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleStartChallenge(challenge)}
                        className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start
                      </Button>
                    </div>
                  </GlassCard>
                </motion.div>
               ))}
             </div>
              <GlassCard className="text-center py-8 mt-6">
                <p className="text-muted-foreground text-lg">
                  Not your hobby? Create your own challenges in <span className="text-primary font-semibold">'Personal Challenges'</span>
                </p>
              </GlassCard>
              </>
             )}
          </TabsContent>

          <TabsContent value="weekly" className="space-y-6">
            {filteredWeeklyChallenges.length === 0 ? (
              <GlassCard className="text-center py-12">
                <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-display font-semibold mb-2">
                  No weekly challenges match your hobbies
                </h3>
                <p className="text-muted-foreground">
                  Update your hobbies in profile settings to see relevant challenges
                </p>
              </GlassCard>
             ) : (
               <>
               <div className="grid grid-cols-1 gap-6">
                 {filteredWeeklyChallenges.map((challenge, index) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard hover>
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-secondary flex items-center justify-center">
                            <challenge.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={categoryColors[challenge.category]}>
                                {challenge.category}
                              </Badge>
                              <Badge variant="outline" className="glass">
                                {challenge.difficulty}
                              </Badge>
                            </div>
                            <h3 className="text-2xl font-display font-semibold mb-1">
                              {challenge.title}
                            </h3>
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground mb-4">
                          {challenge.description}
                        </p>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-semibold">
                              Day {challenge.currentDay} of {challenge.totalDays}
                            </span>
                          </div>
                          <Progress 
                            value={(challenge.currentDay / challenge.totalDays) * 100} 
                            className="h-2"
                          />
                        </div>
                      </div>
                      
                      <div className="flex flex-col justify-between items-end gap-4">
                        <div className="flex items-center gap-1 text-primary">
                          <Trophy className="w-5 h-5" />
                          <span className="text-2xl font-bold">{challenge.points}</span>
                          <span className="text-sm">pts</span>
                        </div>
                        <Button
                          onClick={() => handleStartChallenge(challenge)}
                          className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Continue Today
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
               ))}
             </div>
              <GlassCard className="text-center py-8 mt-6">
                <p className="text-muted-foreground text-lg">
                  Not your hobby? Create your own challenges in <span className="text-primary font-semibold">'Personal Challenges'</span>
                </p>
              </GlassCard>
              </>
             )}
          </TabsContent>

          <TabsContent value="personal" className="space-y-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary hover:opacity-90 text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Personal Challenge
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-strong">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-display">Create Your Challenge</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Challenge Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Master Guitar Solo"
                      value={newChallenge.title}
                      onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
                      className="glass"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="What do you want to achieve?"
                      value={newChallenge.description}
                      onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                      className="glass"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newChallenge.category}
                      onValueChange={(value) => setNewChallenge({ ...newChallenge, category: value })}
                    >
                      <SelectTrigger className="glass">
                        <SelectValue />
                      </SelectTrigger>
                       <SelectContent>
                        <SelectItem value="music">Music</SelectItem>
                        <SelectItem value="art">Art</SelectItem>
                        <SelectItem value="writing">Writing</SelectItem>
                        <SelectItem value="dance">Dance</SelectItem>
                        <SelectItem value="coding">Coding</SelectItem>
                        <SelectItem value="photography">Photography</SelectItem>
                        <SelectItem value="fitness">Fitness</SelectItem>
                        <SelectItem value="cooking">Cooking</SelectItem>
                        <SelectItem value="gaming">Gaming</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="5"
                      max="60"
                      value={newChallenge.duration}
                      onChange={(e) => setNewChallenge({ ...newChallenge, duration: parseInt(e.target.value) })}
                      className="glass"
                    />
                  </div>
                  <Button
                    onClick={handleCreatePersonalChallenge}
                    disabled={!newChallenge.title || !newChallenge.description}
                    className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Create Challenge
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {personalChallenges.length === 0 ? (
              <GlassCard className="text-center py-12">
                <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-display font-semibold mb-2">
                  No Personal Challenges Yet
                </h3>
                <p className="text-muted-foreground">
                  Create your first custom challenge to get started
                </p>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {personalChallenges.map((challenge, index) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <GlassCard hover className="h-full">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center">
                          <Target className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <Badge className={categoryColors[challenge.category as keyof typeof categoryColors]}>
                            {challenge.category}
                          </Badge>
                          <h3 className="text-xl font-display font-semibold mt-2 mb-1">
                            {challenge.title}
                          </h3>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground mb-4">
                        {challenge.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{challenge.duration} min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Trophy className="w-4 h-4 text-primary" />
                            <span className="text-primary font-semibold">{challenge.points} pts</span>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleStartChallenge(challenge)}
                          className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start
                        </Button>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
