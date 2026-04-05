import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { LogOut, User, ChevronDown, Music, Sparkles, Home, Target, Award, Briefcase, Trophy } from 'lucide-react';
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
import { NavLink } from '@/components/NavLink';

const topNavItems = [
  { title: 'Home', url: '/home', icon: Home },
  { title: 'Challenges', url: '/challenges', icon: Target },
  { title: 'Achievements', url: '/achievements', icon: Award },
  { title: 'Your Work', url: '/your-work', icon: Briefcase },
  { title: 'Leaderboard', url: '/leaderboard', icon: Trophy },
];

export default function AuthenticatedHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<any>(null);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single().then(({ data }) => setProfile(data));
    }
  }, [user]);

  return (
    <div className="flex items-center w-full">
      {/* Top nav links - centered */}
      <nav className="flex items-center gap-1 overflow-x-auto absolute left-1/2 -translate-x-1/2">
        {topNavItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors whitespace-nowrap"
            activeClassName="text-primary bg-primary/10"
          >
            <item.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{item.title}</span>
          </NavLink>
        ))}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-3 ml-auto">
        <button
          type="button"
          onClick={() => setShowMusicPlayer(true)}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-400 ring-2 ring-white transition-all duration-200"
          aria-label="Open music player"
        >
          <Music className="w-4 h-4 text-white" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground overflow-hidden ring-2 ring-white">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
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
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <MusicPlayerDialog open={showMusicPlayer} onOpenChange={setShowMusicPlayer} />
      </div>
    </div>
  );
}
