import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileAudio, FileVideo, FileText, Download, Calendar, Trophy, FolderOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import GlassCard from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Submission {
  id: string;
  name: string;
  path: string;
  type: string;
  size: number;
  createdAt: string;
  challengeId?: string;
}

export default function YourWork() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

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
        return <FileAudio className="w-8 h-8 text-primary" />;
      case 'video':
        return <FileVideo className="w-8 h-8 text-secondary" />;
      default:
        return <FileText className="w-8 h-8 text-accent" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return 'Unknown size';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-6xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-2">
            Your Work 📁
          </h1>
          <p className="text-lg text-muted-foreground">
            All your challenge submissions in one place
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassCard className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Uploads</p>
              <p className="text-2xl font-bold">{submissions.length}</p>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-secondary flex items-center justify-center">
              <FileAudio className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Audio Files</p>
              <p className="text-2xl font-bold">
                {submissions.filter((s) => s.type === 'audio').length}
              </p>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <FileVideo className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Video Files</p>
              <p className="text-2xl font-bold">
                {submissions.filter((s) => s.type === 'video').length}
              </p>
            </div>
          </GlassCard>
        </div>

        {/* Submissions List */}
        <div>
          <h2 className="text-2xl font-display font-bold mb-6">
            Submitted Work
          </h2>

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
              <FolderOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-display font-semibold mb-2">
                No submissions yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Complete challenges and upload your work to see them here
              </p>
              <Badge variant="secondary" className="glass">
                <Trophy className="w-3 h-3 mr-1" />
                Earn bonus points by uploading!
              </Badge>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {submissions.map((submission, index) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard hover className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl glass flex items-center justify-center">
                      {getFileIcon(submission.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{submission.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {formatDate(submission.createdAt)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatFileSize(submission.size)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="glass shrink-0"
                      onClick={() => handleDownload(submission)}
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
