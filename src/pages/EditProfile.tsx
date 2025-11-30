import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import GlassCard from '@/components/GlassCard';
import { Camera, Save, Loader2, Upload, User, Mail, MapPin, Shield, Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

export default function EditProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    username: '',
    bio: '',
    mood: '',
    location: '',
    avatar_url: '',
    is_profile_public: true,
    two_factor_enabled: false,
  });
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setProfile({
        full_name: data.full_name || '',
        username: data.username || '',
        bio: data.bio || '',
        mood: data.mood || '',
        location: data.location || '',
        avatar_url: data.avatar_url || '',
        is_profile_public: data.is_profile_public,
        two_factor_enabled: data.two_factor_enabled,
      });
    }
  };

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username === profile.username) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single();

    setUsernameAvailable(!data);
    setCheckingUsername(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({
        title: 'Upload failed',
        description: uploadError.message,
        variant: 'destructive',
      });
    } else {
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setProfile({ ...profile, avatar_url: data.publicUrl });
      toast({
        title: 'Success',
        description: 'Avatar uploaded successfully',
      });
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        username: profile.username,
        bio: profile.bio,
        mood: profile.mood,
        location: profile.location,
        avatar_url: profile.avatar_url,
        is_profile_public: profile.is_profile_public,
        two_factor_enabled: profile.two_factor_enabled,
      })
      .eq('id', user.id);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
      navigate('/profile');
    }
    setLoading(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-3xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-display font-bold mb-2">Edit Profile</h1>
          <p className="text-muted-foreground">Update your profile information</p>
        </motion.div>

        <GlassCard className="p-6 space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-primary flex items-center justify-center text-4xl font-bold text-primary-foreground overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  profile.full_name?.charAt(0) || 'U'
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-primary rounded-full cursor-pointer hover:bg-primary/90">
                <Camera className="w-5 h-5 text-primary-foreground" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
            {uploading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </div>
            )}
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="fullName"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="pl-10 glass"
                placeholder="Your full name"
                maxLength={100}
              />
            </div>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="username"
                value={profile.username}
                onChange={(e) => {
                  setProfile({ ...profile, username: e.target.value });
                  checkUsernameAvailability(e.target.value);
                }}
                className="pl-10 glass"
                placeholder="Choose a unique username"
              />
              {checkingUsername && (
                <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            {usernameAvailable === true && (
              <p className="text-sm text-green-500">Username available!</p>
            )}
            {usernameAvailable === false && (
              <p className="text-sm text-destructive">Username already taken</p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="glass min-h-[100px]"
              placeholder="Tell us about yourself..."
              maxLength={500}
            />
            <p className="text-sm text-muted-foreground text-right">
              {profile.bio.length}/500
            </p>
          </div>

          {/* Mood */}
          <div className="space-y-2">
            <Label htmlFor="mood">Current Mood</Label>
            <Input
              id="mood"
              value={profile.mood}
              onChange={(e) => setProfile({ ...profile, mood: e.target.value })}
              className="glass"
              placeholder="e.g., Energized, Creative, Calm"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location (Optional)</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="pl-10 glass"
                placeholder="Your location"
              />
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="font-display font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy & Security
            </h3>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Public Profile</Label>
                <p className="text-sm text-muted-foreground">
                  Allow others to view your profile
                </p>
              </div>
              <Switch
                checked={profile.is_profile_public}
                onCheckedChange={(checked) =>
                  setProfile({ ...profile, is_profile_public: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security
                </p>
              </div>
              <Switch
                checked={profile.two_factor_enabled}
                onCheckedChange={(checked) =>
                  setProfile({ ...profile, two_factor_enabled: checked })
                }
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() => navigate('/profile')}
              className="flex-1 glass"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading || (usernameAvailable === false)}
              className="flex-1 bg-gradient-primary hover:opacity-90 text-primary-foreground"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
