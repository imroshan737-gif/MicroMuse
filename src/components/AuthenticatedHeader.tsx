import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { LogOut, User, ChevronDown, Music, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

export default function AuthenticatedHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single().then(({ data }) => setProfile(data));
    }
  }, [user]);

  return (
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
  );
}
