import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import GlassCard from '@/components/GlassCard';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Zap, Bell, Sparkles, Check, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Hobby {
  id: string;
  name: string;
  emoji?: string;
  category: string;
}

export default function Settings() {
  const { user } = useAuth();
  const settings = useStore((state) => state.settings);
  const updateSettings = useStore((state) => state.updateSettings);
  
  const [allHobbies, setAllHobbies] = useState<Hobby[]>([]);
  const [userHobbies, setUserHobbies] = useState<string[]>([]);
  const [editingHobbies, setEditingHobbies] = useState(false);
  const [savingHobbies, setSavingHobbies] = useState(false);
  
  const themes = [
    { id: 'studio', name: 'Creative Studio', description: 'Vibrant and energetic' },
    { id: 'galaxy', name: 'Cosmic Galaxy', description: 'Deep space vibes' },
    { id: 'watercolor', name: 'Watercolor Dream', description: 'Soft and flowing' },
  ] as const;

  useEffect(() => {
    if (user) {
      fetchHobbies();
    }
  }, [user]);

  const fetchHobbies = async () => {
    const { data: hobbiesData } = await supabase
      .from('hobbies')
      .select('*')
      .order('name');

    const { data: userHobbiesData } = await supabase
      .from('user_hobbies')
      .select('hobby_id')
      .eq('user_id', user!.id);

    if (hobbiesData) setAllHobbies(hobbiesData);
    if (userHobbiesData) setUserHobbies(userHobbiesData.map(h => h.hobby_id));
  };

  const toggleHobby = (hobbyId: string) => {
    setUserHobbies(prev =>
      prev.includes(hobbyId)
        ? prev.filter(id => id !== hobbyId)
        : [...prev, hobbyId]
    );
  };

  const saveHobbies = async () => {
    if (!user) return;
    setSavingHobbies(true);

    // Delete existing hobbies
    await supabase
      .from('user_hobbies')
      .delete()
      .eq('user_id', user.id);

    // Insert new hobbies
    if (userHobbies.length > 0) {
      const hobbyInserts = userHobbies.map((hobbyId, index) => ({
        user_id: user.id,
        hobby_id: hobbyId,
        display_order: index,
      }));

      await supabase.from('user_hobbies').insert(hobbyInserts);
    }

    toast({
      title: 'Hobbies Updated',
      description: 'Your interests have been saved successfully.',
    });

    setSavingHobbies(false);
    setEditingHobbies(false);
  };
  
  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-4xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-display font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Customize your MicroMuse experience</p>
        </motion.div>

        {/* Hobbies Section */}
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-display font-semibold">Your Interests</h2>
                <p className="text-sm text-muted-foreground">Customize challenges to your hobbies</p>
              </div>
            </div>
            {!editingHobbies ? (
              <Button
                variant="outline"
                className="glass"
                onClick={() => setEditingHobbies(true)}
              >
                Edit Hobbies
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingHobbies(false);
                    fetchHobbies(); // Reset to saved state
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-primary text-primary-foreground"
                  onClick={saveHobbies}
                  disabled={savingHobbies}
                >
                  {savingHobbies ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {editingHobbies ? (
              <motion.div
                key="editing"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"
              >
                {allHobbies.map((hobby) => {
                  const isSelected = userHobbies.includes(hobby.id);
                  return (
                    <motion.button
                      key={hobby.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleHobby(hobby.id)}
                      className={`relative p-3 rounded-lg text-left transition-all ${
                        isSelected
                          ? 'bg-primary/15 border-2 border-primary'
                          : 'glass border border-border/50 hover:bg-muted/30'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
                        </div>
                      )}
                      <span className="text-sm font-medium">
                        {hobby.emoji} {hobby.name}
                      </span>
                    </motion.button>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="display"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-wrap gap-2"
              >
                {allHobbies
                  .filter(h => userHobbies.includes(h.id))
                  .map((hobby) => (
                    <span
                      key={hobby.id}
                      className="px-3 py-1.5 rounded-full bg-primary/15 text-primary text-sm font-medium"
                    >
                      {hobby.emoji} {hobby.name}
                    </span>
                  ))}
                {userHobbies.length === 0 && (
                  <p className="text-muted-foreground text-sm">No hobbies selected. Click "Edit Hobbies" to add some.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
        
        <GlassCard>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Palette className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-display font-semibold">3D Background</h2>
              <p className="text-sm text-muted-foreground">Customize your creative environment</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enable-3d" className="text-base">Enable 3D Scene</Label>
                <p className="text-sm text-muted-foreground">Immersive animated background</p>
              </div>
              <Switch
                id="enable-3d"
                checked={settings.enableThreeD}
                onCheckedChange={(checked) => updateSettings({ enableThreeD: checked })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Scene Intensity</Label>
              <Slider
                value={[settings.threeDIntensity * 100]}
                onValueChange={(value) => updateSettings({ threeDIntensity: value[0] / 100 })}
                max={100}
                step={10}
                disabled={!settings.enableThreeD}
              />
            </div>
            
            <div className="space-y-3">
              <Label>Theme</Label>
              <div className="grid grid-cols-1 gap-3">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => updateSettings({ theme: theme.id })}
                    className={`glass p-4 rounded-xl text-left transition-smooth ${
                      settings.theme === theme.id ? 'ring-2 ring-primary' : ''
                    }`}
                    disabled={!settings.enableThreeD}
                  >
                    <h3 className="font-semibold mb-1">{theme.name}</h3>
                    <p className="text-sm text-muted-foreground">{theme.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
        
        <GlassCard>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-secondary flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-display font-semibold">Performance</h2>
              <p className="text-sm text-muted-foreground">Optimize for your device</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="energy-saver" className="text-base">Energy Saver Mode</Label>
                <p className="text-sm text-muted-foreground">Reduce animations and effects</p>
              </div>
              <Switch
                id="energy-saver"
                checked={settings.energySaver}
                onCheckedChange={(checked) => updateSettings({ energySaver: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="reduced-motion" className="text-base">Reduced Motion</Label>
                <p className="text-sm text-muted-foreground">Minimize animations</p>
              </div>
              <Switch
                id="reduced-motion"
                checked={settings.reducedMotion}
                onCheckedChange={(checked) => updateSettings({ reducedMotion: checked })}
              />
            </div>
          </div>
        </GlassCard>
        
        <GlassCard>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-display font-semibold">Notifications</h2>
              <p className="text-sm text-muted-foreground">Stay on track with reminders</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="daily-reminder" className="text-base">Daily Practice Reminder</Label>
                <p className="text-sm text-muted-foreground">Get notified at your preferred time</p>
              </div>
              <Switch id="daily-reminder" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="streak-alert" className="text-base">Streak Alerts</Label>
                <p className="text-sm text-muted-foreground">Don't break your streak</p>
              </div>
              <Switch id="streak-alert" defaultChecked />
            </div>
          </div>
        </GlassCard>
        
        <div className="flex gap-4">
          <Button 
            onClick={() => {
              localStorage.setItem('settings', JSON.stringify(settings));
              toast({
                title: 'Settings Saved',
                description: 'Your preferences have been saved.',
              });
            }}
            className="bg-gradient-primary text-primary-foreground hover:opacity-90"
          >
            Save Changes
          </Button>
          <Button 
            variant="outline" 
            className="glass"
            onClick={() => {
              updateSettings({
                enableThreeD: true,
                threeDIntensity: 0.7,
                theme: 'studio',
                energySaver: false,
                reducedMotion: false,
              });
            }}
          >
            Reset to Defaults
          </Button>
        </div>
      </div>
    </div>
  );
}