import { create } from 'zustand';

// Free ambient music URLs (royalty-free)
const DEFAULT_TRACKS = [
  {
    id: '1',
    name: 'Peaceful Mind',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
  },
  {
    id: '2', 
    name: 'Calm Waters',
    url: 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_946eb5d4a6.mp3',
  },
  {
    id: '3',
    name: 'Gentle Breeze',
    url: 'https://cdn.pixabay.com/download/audio/2021/11/25/audio_91b32e02f9.mp3',
  },
];

interface Track {
  id: string;
  name: string;
  url: string;
  isUserUpload?: boolean;
}

interface MusicState {
  isPlaying: boolean;
  currentTrack: Track | null;
  tracks: Track[];
  volume: number;
  audioElement: HTMLAudioElement | null;
  
  // Actions
  play: () => void;
  pause: () => void;
  stop: () => void;
  setTrack: (track: Track) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setVolume: (volume: number) => void;
  addUserTrack: (file: File) => void;
  removeUserTrack: (trackId: string) => void;
  initAudio: () => void;
}

export const useMusicStore = create<MusicState>((set, get) => ({
  isPlaying: false,
  currentTrack: null,
  tracks: DEFAULT_TRACKS,
  volume: 0.3,
  audioElement: null,

  initAudio: () => {
    const state = get();
    if (!state.audioElement) {
      const audio = new Audio();
      audio.volume = state.volume;
      audio.loop = false;
      audio.addEventListener('ended', () => {
        get().nextTrack();
      });
      set({ audioElement: audio });
    }
  },

  play: () => {
    const state = get();
    state.initAudio();
    const audio = get().audioElement;
    
    if (!state.currentTrack && state.tracks.length > 0) {
      set({ currentTrack: state.tracks[0] });
      if (audio) {
        audio.src = state.tracks[0].url;
      }
    }
    
    if (audio && get().currentTrack) {
      audio.play().catch(console.error);
      set({ isPlaying: true });
    }
  },

  pause: () => {
    const audio = get().audioElement;
    if (audio) {
      audio.pause();
      set({ isPlaying: false });
    }
  },

  stop: () => {
    const audio = get().audioElement;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      set({ isPlaying: false });
    }
  },

  setTrack: (track: Track) => {
    const state = get();
    state.initAudio();
    const audio = get().audioElement;
    
    set({ currentTrack: track });
    if (audio) {
      audio.src = track.url;
      if (state.isPlaying) {
        audio.play().catch(console.error);
      }
    }
  },

  nextTrack: () => {
    const state = get();
    if (state.tracks.length === 0) return;
    
    const currentIndex = state.currentTrack 
      ? state.tracks.findIndex(t => t.id === state.currentTrack?.id)
      : -1;
    const nextIndex = (currentIndex + 1) % state.tracks.length;
    state.setTrack(state.tracks[nextIndex]);
  },

  previousTrack: () => {
    const state = get();
    if (state.tracks.length === 0) return;
    
    const currentIndex = state.currentTrack 
      ? state.tracks.findIndex(t => t.id === state.currentTrack?.id)
      : 0;
    const prevIndex = currentIndex <= 0 ? state.tracks.length - 1 : currentIndex - 1;
    state.setTrack(state.tracks[prevIndex]);
  },

  setVolume: (volume: number) => {
    const audio = get().audioElement;
    if (audio) {
      audio.volume = volume;
    }
    set({ volume });
  },

  addUserTrack: (file: File) => {
    const url = URL.createObjectURL(file);
    const newTrack: Track = {
      id: `user-${Date.now()}`,
      name: file.name.replace(/\.[^/.]+$/, ''),
      url,
      isUserUpload: true,
    };
    set((state) => ({ 
      tracks: [...state.tracks, newTrack] 
    }));
  },

  removeUserTrack: (trackId: string) => {
    const state = get();
    const trackToRemove = state.tracks.find(t => t.id === trackId);
    
    if (trackToRemove?.isUserUpload && trackToRemove.url.startsWith('blob:')) {
      URL.revokeObjectURL(trackToRemove.url);
    }
    
    set((s) => ({
      tracks: s.tracks.filter(t => t.id !== trackId),
      currentTrack: s.currentTrack?.id === trackId ? null : s.currentTrack,
    }));
    
    if (state.currentTrack?.id === trackId) {
      state.stop();
    }
  },
}));
