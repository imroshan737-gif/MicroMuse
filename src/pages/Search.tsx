import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Search as SearchIcon, UserPlus, UserCheck, MessageCircle, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useFollows } from '@/hooks/useFollows';
import { getOrCreateConversation } from '@/hooks/useMessages';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/GlassCard';

interface SearchResult {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  total_points: number | null;
}

function UserCard({ profile, currentUserId }: { profile: SearchResult; currentUserId: string }) {
  const { isFollowing, isMutual, follow, unfollow, loading, followersCount } = useFollows(profile.id);
  const navigate = useNavigate();

  const handleMessage = async () => {
    const convoId = await getOrCreateConversation(currentUserId, profile.id);
    if (convoId) navigate(`/messages?conversation=${convoId}`);
  };

  if (profile.id === currentUserId) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <GlassCard className="flex items-center gap-4 p-4">
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
        <div className="flex items-center gap-2">
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

export default function Search() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);

    const searchTerm = `%${query.trim()}%`;
    const { data } = await supabase
      .from('public_profiles')
      .select('id, full_name, username, avatar_url, bio, total_points')
      .or(`full_name.ilike.${searchTerm},username.ilike.${searchTerm}`)
      .limit(20);

    setResults((data as SearchResult[]) || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-6 pb-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Search People</h1>
          <p className="text-muted-foreground">Find and connect with other creatives</p>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or username..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={loading}>
            Search
          </Button>
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
          {!loading && searched && results.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <GlassCard className="text-center py-12">
                <SearchIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-lg font-medium">No users found</p>
                <p className="text-sm text-muted-foreground">Try a different search term</p>
              </GlassCard>
            </motion.div>
          )}
          {!loading && results.map(profile => (
            <UserCard key={profile.id!} profile={profile} currentUserId={user?.id || ''} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
