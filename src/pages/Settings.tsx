import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import GlassCard from '@/components/GlassCard';
import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';
import { Palette, Zap, Volume2, Bell, Shield } from 'lucide-react';

export default function Settings() {
  const settings = useStore((state) => state.settings);
  const updateSettings = useStore((state) => state.updateSettings);
  
  const themes = [
    { id: 'studio', name: 'Creative Studio', description: 'Vibrant and energetic' },
    { id: 'galaxy', name: 'Cosmic Galaxy', description: 'Deep space vibes' },
    { id: 'watercolor', name: 'Watercolor Dream', description: 'Soft and flowing' },
  ] as const;
  
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
              alert('Settings saved successfully!');
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
