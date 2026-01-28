import { useState, useEffect } from 'react';
import { NavLink } from './NavLink';
import { Button } from './ui/button';
import { Sparkles, LogOut, User, ChevronDown, Music, Trophy } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import MusicPlayerDialog from './MusicPlayerDialog';

export default function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<any>(null);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    setProfile(data);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-border/50">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer hover-scale"
          onClick={() => navigate('/home')}
        >
          <Sparkles className="w-6 h-6 text-primary animate-pulse-glow" />
          <span className="text-xl font-display font-bold gradient-text">
            MicroMuse
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/home')}
            className={location.pathname === '/home' ? 'bg-primary/10 text-primary' : ''}
          >
            Home
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/challenges')}
            className={location.pathname === '/challenges' ? 'bg-primary/10 text-primary' : ''}
          >
            Challenges
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/achievements')}
            className={location.pathname === '/achievements' ? 'bg-primary/10 text-primary' : ''}
          >
            Achievements
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/your-work')}
            className={location.pathname === '/your-work' ? 'bg-primary/10 text-primary' : ''}
          >
            Your Work
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/leaderboard')}
            className={location.pathname === '/leaderboard' ? 'bg-primary/10 text-primary' : ''}
          >
            <Trophy className="w-4 h-4 mr-1" />
            Leaderboard
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground overflow-hidden">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'
                )}
              </div>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 glass-strong">
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Sparkles className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowMusicPlayer(true)}>
              <Music className="w-4 h-4 mr-2" />
              Music
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <MusicPlayerDialog 
          open={showMusicPlayer} 
          onOpenChange={setShowMusicPlayer} 
        />
      </nav>
    </header>
  );
}
