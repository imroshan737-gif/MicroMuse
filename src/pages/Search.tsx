import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Search as SearchIcon, UserPlus, UserCheck, MessageCircle, Users, ArrowLeft, Calendar, MapPin, Flame, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useFollows } from '@/hooks/useFollows';
import { getOrCreateConversation } from '@/hooks/useMessages';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface SearchResult {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  total_points: number | null;
  location: string | null;
  current_streak: number | null;
  longest_streak: number | null;
  total_sessions: number | null;
  created_at: string | null;
  mood: string | null;
}

function UserCard({ profile, currentUserId, onViewProfile }: { profile: SearchResult; currentUserId: string; onViewProfile: (p: SearchResult) => void }) {
  const { isFollowing, isMutual, follow, unfollow, loading, followersCount } = useFollows(profile.id);
  const navigate = useNavigate();

  const handleMessage = async () => {
    const convoId = await getOrCreateConversation(currentUserId, profile.id);
    if (convoId) navigate(`/messages?conversation=${convoId}`);
  };

  if (profile.id === currentUserId) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <GlassCard className="flex items-center gap-4 p-4 cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all" onClick={() => onViewProfile(profile)}>
        <Avatar className="w-12 h-12 ring-2 ring-primary/20">
          <AvatarImage src={profile.avatar_url || ''} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold">
            {profile.full_name?.charAt(0) || profile.username?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">{profile.full_name || 'Anonymous'}</p>
          <p className="text-sm text-muted-foreground truncate">@{profile.username || 'user'}</p>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <Users className="w-3 h-3" />
            <span>{followersCount} followers</span>
            {profile.total_points ? <span>• {profile.total_points} pts</span> : null}
          </div>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {isMutual && (
            <Button variant="outline" size="sm" onClick={handleMessage} className="gap-1">
              <MessageCircle className="w-4 h-4" />
              Message
            </Button>
          )}
          <Button
            variant={isFollowing ? 'secondary' : 'default'}
            size="sm"
            onClick={isFollowing ? unfollow : follow}
            disabled={loading}
            className="gap-1"
          >
            {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {isFollowing ? 'Following' : 'Follow'}
          </Button>
        </div>
      </GlassCard>
    </motion.div>
  );
}

function UserProfileView({ profile, currentUserId, onBack }: { profile: SearchResult; currentUserId: string; onBack: () => void }) {
  const { isFollowing, isMutual, follow, unfollow, loading, followersCount, followingCount } = useFollows(profile.id);
  const [hobbies, setHobbies] = useState<{ name: string; emoji: string | null }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHobbies = async () => {
      const { data } = await supabase
        .from('user_hobbies')
        .select('hobby_id')
        .eq('user_id', profile.id);
      if (data && data.length > 0) {
        const hobbyIds = data.map(h => h.hobby_id);
        const { data: hobbyData } = await supabase
          .from('hobbies')
          .select('name, emoji')
          .in('id', hobbyIds);
        setHobbies(hobbyData || []);
      }
    };
    fetchHobbies();
  }, [profile.id]);

  const handleMessage = async () => {
    const convoId = await getOrCreateConversation(currentUserId, profile.id);
    if (convoId) navigate(`/messages?conversation=${convoId}`);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2 mb-2">
        <ArrowLeft className="w-4 h-4" /> Back to search
      </Button>

      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Avatar className="w-24 h-24 ring-4 ring-primary/20">
            <AvatarImage src={profile.avatar_url || ''} />
            <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
              {profile.full_name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-display font-bold">{profile.full_name || 'Anonymous'}</h2>
            <p className="text-muted-foreground">@{profile.username || 'user'}</p>
            {profile.mood && <p className="text-sm mt-1">Mood: {profile.mood}</p>}
            {profile.bio && <p className="text-sm text-muted-foreground mt-2">{profile.bio}</p>}
            <div className="flex items-center gap-4 mt-3 justify-center sm:justify-start">
              <span className="text-sm"><strong>{followersCount}</strong> followers</span>
              <span className="text-sm"><strong>{followingCount}</strong> following</span>
            </div>
            <div className="flex items-center gap-2 mt-4 justify-center sm:justify-start">
              <Button
                variant={isFollowing ? 'secondary' : 'default'}
                onClick={isFollowing ? unfollow : follow}
                disabled={loading}
                className="gap-1"
              >
                {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
              {isMutual && (
                <Button variant="outline" onClick={handleMessage} className="gap-1">
                  <MessageCircle className="w-4 h-4" /> Message
                </Button>
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <GlassCard className="p-4 text-center">
          <Star className="w-5 h-5 mx-auto text-primary mb-1" />
          <p className="text-xl font-bold">{profile.total_points || 0}</p>
          <p className="text-xs text-muted-foreground">Points</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <Flame className="w-5 h-5 mx-auto text-orange-500 mb-1" />
          <p className="text-xl font-bold">{profile.current_streak || 0}</p>
          <p className="text-xs text-muted-foreground">Current Streak</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <Flame className="w-5 h-5 mx-auto text-red-500 mb-1" />
          <p className="text-xl font-bold">{profile.longest_streak || 0}</p>
          <p className="text-xs text-muted-foreground">Best Streak</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <Calendar className="w-5 h-5 mx-auto text-blue-500 mb-1" />
          <p className="text-xl font-bold">{profile.total_sessions || 0}</p>
          <p className="text-xs text-muted-foreground">Sessions</p>
        </GlassCard>
      </div>

      {/* Info */}
      <GlassCard className="p-4 space-y-3">
        <h3 className="font-semibold text-lg">Info</h3>
        {profile.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" /> {profile.location}
          </div>
        )}
        {profile.created_at && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" /> Joined {format(new Date(profile.created_at), 'MMMM yyyy')}
          </div>
        )}
      </GlassCard>

      {/* Hobbies */}
      {hobbies.length > 0 && (
        <GlassCard className="p-4">
          <h3 className="font-semibold text-lg mb-3">Hobbies & Interests</h3>
          <div className="flex flex-wrap gap-2">
            {hobbies.map((h, i) => (
              <Badge key={i} variant="secondary" className="text-sm">
                {h.emoji && <span className="mr-1">{h.emoji}</span>}
                {h.name}
              </Badge>
            ))}
          </div>
        </GlassCard>
      )}
    </motion.div>
  );
}

export default function Search() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<SearchResult | null>(null);

  const doSearch = useCallback(async (term: string) => {
    if (!term.trim()) { setResults([]); return; }
    setLoading(true);
    const searchTerm = `%${term.trim()}%`;
    const { data } = await supabase
      .from('public_profiles')
      .select('id, full_name, username, avatar_url, bio, total_points, location, current_streak, longest_streak, total_sessions, created_at, mood')
      .or(`full_name.ilike.${searchTerm},username.ilike.${searchTerm}`)
      .limit(20);
    setResults((data as SearchResult[]) || []);
    setLoading(false);
  }, []);

  // Live search as user types
  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  if (selectedProfile) {
    return (
      <div className="min-h-screen pt-6 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <UserProfileView profile={selectedProfile} currentUserId={user?.id || ''} onBack={() => setSelectedProfile(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-6 pb-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Search People</h1>
          <p className="text-muted-foreground">Find and connect with other creatives</p>
        </div>

        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or username..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <AnimatePresence>
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <GlassCard key={i} className="h-20 animate-pulse">
                  <div className="h-full bg-muted/20 rounded-lg" />
                </GlassCard>
              ))}
            </div>
          )}
          {!loading && query.trim() && results.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <GlassCard className="text-center py-12">
                <SearchIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-lg font-medium">No users found</p>
                <p className="text-sm text-muted-foreground">Try a different search term</p>
              </GlassCard>
            </motion.div>
          )}
          {!loading && results.map(profile => (
            <UserCard key={profile.id!} profile={profile} currentUserId={user?.id || ''} onViewProfile={setSelectedProfile} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
