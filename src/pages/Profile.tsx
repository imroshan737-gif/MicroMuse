import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import GlassCard from '@/components/GlassCard';
import { Trophy, Flame, Star, Calendar, Music, Award, Settings as SettingsIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const { data: achievementsData } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievements (*)
      `)
      .eq('user_id', user.id);

    const { data: challengesData } = await supabase
      .from('user_challenges')
      .select(`
        *,
        challenges (*)
      `)
      .eq('user_id', user.id)
      .eq('is_completed', true)
      .order('completed_at', { ascending: false })
      .limit(5);

    setProfile(profileData);
    setLoading(false);
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading profile...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-6xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="flex flex-col md:flex-row items-center gap-6 p-8">
            <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center text-3xl font-bold text-primary-foreground overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                profile.full_name?.charAt(0) || user.email?.charAt(0) || 'U'
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-display font-bold mb-2">
                {profile.full_name || profile.username || 'Creative Explorer'}
              </h1>
              <p className="text-muted-foreground mb-2">
                @{profile.username || user.email?.split('@')[0]}
              </p>
              {profile.bio && (
                <p className="text-sm text-muted-foreground mb-4">
                  {profile.bio}
                </p>
              )}
              {profile.mood && (
                <Badge variant="outline" className="glass">
                  {profile.mood}
                </Badge>
              )}
            </div>
            <Button
              className="bg-gradient-primary text-primary-foreground hover:opacity-90"
              onClick={() => navigate('/profile/edit')}
            >
              <SettingsIcon className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </GlassCard>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <GlassCard className="text-center p-6">
            <Flame className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-3xl font-bold mb-1">{profile.current_streak || 0}</p>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </GlassCard>
          <GlassCard className="text-center p-6">
            <Trophy className="w-8 h-8 text-secondary mx-auto mb-2" />
            <p className="text-3xl font-bold mb-1">{profile.total_sessions || 0}</p>
            <p className="text-sm text-muted-foreground">Sessions</p>
          </GlassCard>
          <GlassCard className="text-center p-6">
            <Award className="w-8 h-8 text-accent mx-auto mb-2" />
            <p className="text-3xl font-bold mb-1">0</p>
            <p className="text-sm text-muted-foreground">Badges</p>
          </GlassCard>
          <GlassCard className="text-center p-6">
            <Star className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-3xl font-bold mb-1">{profile.total_points || 0}</p>
            <p className="text-sm text-muted-foreground">Total Points</p>
          </GlassCard>
        </div>
        
        <div>
          <h2 className="text-2xl font-display font-bold mb-4">Recent Activity</h2>
          <GlassCard className="p-6 text-center">
            <p className="text-muted-foreground">
              Complete challenges to see your activity here
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
