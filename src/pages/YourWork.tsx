import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileAudio, FileVideo, FileText, Download, Calendar, Trophy, FolderOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import GlassCard from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Submission {
  id: string;
  name: string;
  path: string;
  type: string;
  size: number;
  createdAt: string;
  challengeId?: string;
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'audio', label: 'Audio' },
  { key: 'video', label: 'Video' },
  { key: 'document', label: 'Documents' },
] as const;

export default function YourWork() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>('all');

  useEffect(() => {
    if (user) {
      fetchSubmissions();
    }
  }, [user]);

  const fetchSubmissions = async () => {
    if (!user) return;

    try {
      // List files from user's submissions folder
      const { data, error } = await supabase.storage
        .from('avatars')
        .list(`${user.id}/submissions`, {
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) {
        console.error('Error fetching submissions:', error);
        setSubmissions([]);
        return;
      }

      const files: Submission[] = (data || []).map((file) => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        let type = 'document';
        if (ext === 'mp3') type = 'audio';
        if (ext === 'mp4') type = 'video';
        if (ext === 'pdf') type = 'document';

        return {
          id: file.id || file.name,
          name: file.name,
          path: `${user.id}/submissions/${file.name}`,
          type,
          size: file.metadata?.size || 0,
          createdAt: file.created_at || new Date().toISOString(),
        };
      });

      setSubmissions(files);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (submission: Submission) => {
    const { data } = await supabase.storage
      .from('avatars')
      .createSignedUrl(submission.path, 3600);

    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank');
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'audio':
        return <FileAudio className="w-5 h-5 text-primary" />;
      case 'video':
        return <FileVideo className="w-5 h-5 text-foreground" />;
      default:
        return <FileText className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const typeLabel = (type: string) =>
    type === 'audio' ? 'Audio' : type === 'video' ? 'Video' : 'Document';

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '—';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const counts = useMemo(
    () => ({
      total: submissions.length,
      audio: submissions.filter((s) => s.type === 'audio').length,
      video: submissions.filter((s) => s.type === 'video').length,
      document: submissions.filter((s) => s.type === 'document').length,
    }),
    [submissions]
  );

  const filtered =
    filter === 'all' ? submissions : submissions.filter((s) => s.type === filter);

  return (
    <div className="min-h-screen pt-6 pb-12 px-4">
      <div className="container mx-auto max-w-6xl space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="flex items-center gap-3 mb-2 justify-center">
            <div className="h-px w-12 bg-border" />
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Archive</span>
            <div className="h-px w-12 bg-border" />
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-semibold tracking-tight mb-3">
            Your Work
          </h1>
          <p className="text-base text-foreground/70 max-w-xl mx-auto">
            A quiet gallery of everything you've made — saved, sorted, and yours.
          </p>
        </motion.div>

        {/* Stats — single divided editorial panel */}
        <GlassCard className="p-0 overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
            <div className="flex items-center gap-4 px-6 py-5">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                <FolderOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5">Total Uploads</p>
                <p className="text-2xl font-semibold tabular-nums">{counts.total}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 px-6 py-5">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                <FileAudio className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5">Audio Files</p>
                <p className="text-2xl font-semibold tabular-nums">{counts.audio}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 px-6 py-5">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <FileVideo className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5">Video Files</p>
                <p className="text-2xl font-semibold tabular-nums">{counts.video}</p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Submissions */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-2xl font-display font-semibold">Submitted Work</h2>

            {/* Type filter */}
            {!loading && submissions.length > 0 && (
              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-muted/60 border border-border w-fit">
                {FILTERS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-sm font-medium transition-smooth',
                      filter === f.key
                        ? 'bg-card text-foreground shadow-sm border border-border'
                        : 'text-foreground/70 hover:text-foreground'
                    )}
                  >
                    {f.label}
                    {f.key !== 'all' && (
                      <span className="ml-1.5 text-xs tabular-nums text-muted-foreground">
                        {counts[f.key]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <GlassCard key={i} className="h-24 animate-pulse">
                  <div className="h-full bg-muted/20 rounded-lg" />
                </GlassCard>
              ))}
            </div>
          ) : submissions.length === 0 ? (
            <GlassCard className="text-center py-16">
              <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="w-7 h-7 text-muted-foreground" strokeWidth={1.75} />
              </div>
              <h3 className="text-xl font-display font-semibold mb-2">No submissions yet</h3>
              <p className="text-foreground/70 mb-5 max-w-sm mx-auto">
                Complete challenges and upload your work to see them here
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent border border-primary/30">
                <Trophy className="w-3.5 h-3.5 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  Earn bonus points by uploading
                </span>
              </div>
            </GlassCard>
          ) : filtered.length === 0 ? (
            <GlassCard className="text-center py-12">
              <p className="text-foreground/70">No {typeLabel(filter).toLowerCase()} files yet</p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((submission, index) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard hover className="flex items-center gap-4 p-4">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      {getFileIcon(submission.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-semibold truncate">{submission.name}</h3>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-foreground/60">
                        <Calendar className="w-3 h-3 shrink-0" />
                        <span>{formatDate(submission.createdAt)}</span>
                        <span className="text-border">•</span>
                        <span className="tabular-nums">{formatFileSize(submission.size)}</span>
                      </div>
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-accent text-primary">
                        {typeLabel(submission.type)}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="shrink-0 bg-card"
                      onClick={() => handleDownload(submission)}
                      aria-label={`Download ${submission.name}`}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
