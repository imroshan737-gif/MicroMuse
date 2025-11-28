import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  streak: number;
  totalSessions: number;
  badges: string[];
  interests: string[];
  instruments: string[];
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: 'music' | 'art' | 'writing' | 'dance';
  duration: 10 | 15;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prompt?: string;
}

interface Session {
  id: string;
  challengeId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  recordingUrl?: string;
  aiScore?: {
    creativity: number;
    technique: number;
    adherence: number;
    overall: number;
  };
  feedback?: string;
}

interface AppState {
  user: User | null;
  currentChallenge: Challenge | null;
  currentSession: Session | null;
  isRecording: boolean;
  audioLevel: number;
  settings: {
    enableThreeD: boolean;
    threeDIntensity: number;
    theme: 'studio' | 'galaxy' | 'watercolor';
    energySaver: boolean;
    reducedMotion: boolean;
  };
  
  // Actions
  setUser: (user: User | null) => void;
  startChallenge: (challenge: Challenge) => void;
  endChallenge: () => void;
  startRecording: () => void;
  stopRecording: () => void;
  setAudioLevel: (level: number) => void;
  updateSettings: (settings: Partial<AppState['settings']>) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  currentChallenge: null,
  currentSession: null,
  isRecording: false,
  audioLevel: 0,
  settings: {
    enableThreeD: true,
    threeDIntensity: 0.7,
    theme: 'studio',
    energySaver: false,
    reducedMotion: false,
  },
  
  setUser: (user) => set({ user }),
  
  startChallenge: (challenge) => set({ 
    currentChallenge: challenge,
    currentSession: {
      id: Math.random().toString(36).substr(2, 9),
      challengeId: challenge.id,
      userId: 'demo-user',
      startTime: new Date(),
    }
  }),
  
  endChallenge: () => set({ 
    currentChallenge: null,
    currentSession: null,
    isRecording: false,
  }),
  
  startRecording: () => set({ isRecording: true }),
  stopRecording: () => set({ isRecording: false }),
  setAudioLevel: (level) => set({ audioLevel: level }),
  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings }
  })),
}));
