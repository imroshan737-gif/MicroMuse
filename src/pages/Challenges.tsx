import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import GlassCard from '@/components/GlassCard';
import { Clock, Trophy, Target, Play, Plus, Calendar, Music, Palette, PenTool, Zap } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserHobbies } from '@/hooks/useUserHobbies';

const dailyChallenges = [
  {
    id: 'd1',
    title: 'Morning Melody Maker',
    description: 'Compose a cheerful 30-second tune to kickstart your day',
    category: 'music' as const,
    duration: 10,
    difficulty: 'beginner' as const,
    points: 50,
    icon: Music,
  },
  {
    id: 'd2',
    title: 'Color Emotion Study',
    description: 'Paint a feeling using only warm colors',
    category: 'art' as const,
    duration: 15,
    difficulty: 'beginner' as const,
    points: 75,
    icon: Palette,
  },
  {
    id: 'd3',
    title: 'Flash Fiction',
    description: 'Write a complete story in exactly 50 words',
    category: 'writing' as const,
    duration: 10,
    difficulty: 'intermediate' as const,
    points: 60,
    icon: PenTool,
  },
  {
    id: 'd4',
    title: 'Rhythm Express',
    description: 'Create a 20-second dance expressing joy',
    category: 'dance' as const,
    duration: 10,
    difficulty: 'beginner' as const,
    points: 50,
    icon: Zap,
  },
];

const weeklyChallenges = [
  {
    id: 'w1',
    title: 'Symphony Builder',
    description: 'Create a full 2-minute composition across 7 days',
    category: 'music' as const,
    totalDays: 7,
    currentDay: 0,
    difficulty: 'advanced' as const,
    points: 500,
    icon: Music,
  },
  {
    id: 'w2',
    title: 'Masterpiece Journey',
    description: 'Complete a detailed artwork through daily progress',
    category: 'art' as const,
    totalDays: 7,
    currentDay: 0,
    difficulty: 'advanced' as const,
    points: 600,
    icon: Palette,
  },
  {
    id: 'w3',
    title: 'Short Story Saga',
    description: 'Write a 1000-word story, 150 words per day',
    category: 'writing' as const,
    totalDays: 7,
    currentDay: 0,
    difficulty: 'intermediate' as const,
    points: 450,
    icon: PenTool,
  },
];

const categoryColors = {
  music: 'bg-primary/10 text-primary border-primary/20',
  art: 'bg-secondary/10 text-secondary border-secondary/20',
  writing: 'bg-accent/10 text-accent border-accent/20',
  dance: 'bg-primary/10 text-primary border-primary/20',
};

export default function Challenges() {
  const navigate = useNavigate();
  const startChallenge = useStore((state) => state.startChallenge);
  const { hobbies, loading: hobbiesLoading } = useUserHobbies();
  const [personalChallenges, setPersonalChallenges] = useState<any[]>([]);
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    category: 'music',
    duration: 10,
  });

  // Filter challenges based on user's hobbies
  const userHobbyCategories = useMemo(() => {
    return new Set(hobbies.map(h => h.category.toLowerCase()));
  }, [hobbies]);

  const filteredDailyChallenges = useMemo(() => {
    if (userHobbyCategories.size === 0) return dailyChallenges;
    return dailyChallenges.filter(c => userHobbyCategories.has(c.category));
  }, [userHobbyCategories]);

  const filteredWeeklyChallenges = useMemo(() => {
    if (userHobbyCategories.size === 0) return weeklyChallenges;
    return weeklyChallenges.filter(c => userHobbyCategories.has(c.category));
  }, [userHobbyCategories]);

  const handleStartChallenge = (challenge: any) => {
    startChallenge(challenge);
    navigate('/challenge');
  };

  const handleCreatePersonalChallenge = () => {
    const challenge = {
      id: `p${Date.now()}`,
      ...newChallenge,
      difficulty: 'beginner' as const,
      points: newChallenge.duration * 5,
      isPersonal: true,
    };
    setPersonalChallenges([...personalChallenges, challenge]);
    setNewChallenge({ title: '', description: '', category: 'music', duration: 10 });
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
