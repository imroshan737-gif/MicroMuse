import { useState, useRef } from 'react';
import { useMusicStore } from '@/store/useMusicStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Upload, 
  Trash2,
  Music2,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

interface MusicPlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MusicPlayerDialog({ open, onOpenChange }: MusicPlayerDialogProps) {
  const {
    isPlaying,
    currentTrack,
    tracks,
    volume,
    play,
    pause,
    setTrack,
    nextTrack,
    previousTrack,
    setVolume,
    addUserTrack,
    removeUserTrack,
  } = useMusicStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate audio file
    if (!file.type.startsWith('audio/')) {
      toast({
        title: 'Invalid file',
        description: 'Please upload an audio file (MP3, WAV, etc.)',
        variant: 'destructive',
      });
      return;
    }

    // Max 15MB
    if (file.size > 15 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 15MB',
        variant: 'destructive',
      });
      return;
    }

    addUserTrack(file);
    toast({
      title: 'Music added!',
      description: `"${file.name}" has been added to your playlist`,
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handleTrackSelect = (track: typeof tracks[0]) => {
    setTrack(track);
    if (!isPlaying) {
      play();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Music2 className="w-5 h-5 text-primary" />
            Background Music
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Track Display */}
          <div className="glass p-4 rounded-xl text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTrack?.id || 'none'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <p className="text-sm text-muted-foreground mb-1">Now Playing</p>
                <p className="font-medium text-lg">
                  {currentTrack?.name || 'Select a track'}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={previousTrack}
              className="hover:bg-primary/20"
            >
              <SkipBack className="w-5 h-5" />
            </Button>
            
            <Button
              size="lg"
              onClick={handlePlayPause}
              className="w-14 h-14 rounded-full bg-gradient-primary hover:opacity-90"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-primary-foreground" />
              ) : (
                <Play className="w-6 h-6 text-primary-foreground ml-1" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={nextTrack}
              className="hover:bg-primary/20"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3 px-2">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={[volume * 100]}
              onValueChange={(value) => setVolume(value[0] / 100)}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground w-8">
              {Math.round(volume * 100)}%
            </span>
          </div>

          {/* Track List */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            <p className="text-sm font-medium text-muted-foreground mb-2">Playlist</p>
            {tracks.map((track) => (
              <div
                key={track.id}
                onClick={() => handleTrackSelect(track)}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                  currentTrack?.id === track.id
                    ? 'bg-primary/20 border border-primary/40'
                    : 'glass hover:bg-primary/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  {currentTrack?.id === track.id && isPlaying ? (
                    <div className="flex gap-0.5">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-primary rounded-full"
                          animate={{ height: [8, 16, 8] }}
                          transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            delay: i * 0.1,
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <Music2 className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">{track.name}</span>
                  {track.isUserUpload && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent">
                      Custom
                    </span>
                  )}
                </div>
                
                {track.isUserUpload && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeUserTrack(track.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Upload Custom Music */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              className="w-full glass"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Your Music
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              MP3, WAV, etc. (max 15MB)
            </p>
          </div>

          {/* Info */}
          <p className="text-xs text-center text-muted-foreground">
            🎵 Music will automatically pause when you start a challenge
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
