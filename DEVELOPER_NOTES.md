# MicroMuse - Developer Notes

## 🎨 Project Overview

MicroMuse is an immersive creative practice platform featuring:
- **3D animated backgrounds** with audio-reactive elements
- **10-minute micro-sessions** for music, art, writing, and dance
- **AI-powered feedback** and progress tracking
- **Glassmorphic UI** with premium typography and smooth animations

## 🚀 Quick Start

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:8080`

## 📁 Project Structure

```
src/
├── components/
│   ├── ThreeScene.tsx      # 3D animated background (React-Three-Fiber)
│   ├── GlassCard.tsx        # Reusable glassmorphic card component
│   ├── Header.tsx           # Navigation header
│   └── ui/                  # shadcn UI components
├── pages/
│   ├── Landing.tsx          # Landing page with feature showcase
│   ├── Onboarding.tsx       # 3-step onboarding flow
│   ├── Home.tsx             # Main feed with challenges
│   ├── Challenge.tsx        # Active challenge session
│   ├── Profile.tsx          # User profile and achievements
│   └── Settings.tsx         # App settings and customization
├── store/
│   └── useStore.ts          # Zustand global state management
└── index.css                # Design system with HSL colors
```

## 🎨 Design System

### Color Palette
- **Primary**: Coral/Orange (#FF6B6B) - Energy and creativity
- **Secondary**: Deep Teal (#4ECDC4) - Focus and calm
- **Accent**: Warm Gold (#FFE66D) - Highlights

### Typography
- **Display**: Playfair Display (headings)
- **Body**: Inter (UI text)

### Key Design Patterns
- **Glassmorphism**: `.glass` and `.glass-strong` utility classes
- **Gradients**: `bg-gradient-primary`, `bg-gradient-secondary`
- **Hover Effects**: `.hover-lift` for elevation on hover
- **Animations**: Framer Motion for page transitions

## 🔧 Backend Integration

### API Endpoints (to be connected)

All endpoints should be prefixed with your backend URL:

```typescript
const API_BASE = process.env.VITE_API_URL || 'http://localhost:3000';
```

#### Challenges
- `GET /challenges` - Fetch available challenges
- `GET /challenges/:id` - Get challenge details

#### Sessions
- `POST /sessions` - Create new session
- `POST /sessions/:id/recording` - Upload recording
- `GET /sessions/:id` - Get session details

#### AI Evaluation
- `POST /ai/evaluate` - Get AI feedback on recording
  ```typescript
  {
    sessionId: string;
    recordingUrl: string;
    category: 'music' | 'art' | 'writing' | 'dance';
  }
  ```
- `POST /ai/generate` - Generate creative prompts
  ```typescript
  {
    category: string;
    mood: string;
    difficulty: string;
  }
  ```

#### File Upload
- `POST /uploads/presign` - Get presigned URL for S3 upload
  ```typescript
  {
    filename: string;
    contentType: string;
  }
  ```

### WebSocket Events

Connect to: `ws://your-backend/ws/rooms/:roomId`

**Incoming Events:**
```typescript
// New participant joins
{ type: 'participant-join', data: { userId, name } }

// Session update
{ type: 'session-update', data: { sessionId, state } }

// AI feedback ready
{ type: 'ai-feedback', data: { sessionId, feedback, scores } }

// Remix completed
{ type: 'remix-ready', data: { originalId, remixUrl } }

// Media processed
{ type: 'media-processed', data: { sessionId, url, thumbnail } }
```

**Outgoing Events:**
```typescript
// Start recording
{ type: 'start-recording', roomId: string }

// Stop recording
{ type: 'stop-recording', roomId: string }

// Chat message
{ type: 'chat-message', text: string }
```

## 🎵 Audio Features

### Recording
The app uses the Web Audio API for recording:

```typescript
// Request microphone access
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

// Create audio context
const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();

// Monitor audio levels
analyser.getByteFrequencyData(dataArray);
```

### Audio Visualization
Real-time waveform rendering happens in the challenge session:
- Audio levels affect 3D scene intensity
- Waveform display shows recording progress
- Frequency analysis drives visual effects

## 🌐 3D Background

### Customization
Users can customize the 3D scene in Settings:

**Themes:**
- `studio` - Vibrant creative studio colors
- `galaxy` - Deep space cosmic vibes
- `watercolor` - Soft flowing pastels

**Performance Options:**
- **Energy Saver**: Disables 3D rendering
- **Reduced Motion**: Minimizes animations
- **Intensity Slider**: Controls animation amplitude

### Technical Details
- Built with **React-Three-Fiber** and **@react-three/drei**
- Uses `Float` component for organic motion
- `MeshDistortMaterial` for dynamic shapes
- Audio-reactive scaling based on mic input

## 📱 PWA Setup (Future)

To enable Progressive Web App features:

1. Add service worker in `public/`
2. Create `manifest.json` with app metadata
3. Add icons in various sizes to `public/icons/`
4. Update `index.html` with manifest link

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

Test coverage should include:
- Store actions and state updates
- Component rendering
- User interactions
- Audio permission handling

### E2E Tests (Playwright)
```bash
npm run test:e2e
```

Key flows to test:
1. Onboarding completion
2. Starting a challenge
3. Recording a session
4. Viewing profile
5. Changing settings

## 🔐 Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
VITE_ENABLE_ANALYTICS=false
```

## 🚢 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
```

Deploy the `dist/` folder to your hosting service.

### Backend Connection
Update API URLs in production:
1. Set environment variables in hosting dashboard
2. Update CORS origins in backend
3. Configure WebSocket endpoints

## 📊 Analytics Events

Track key user actions:
- `challenge_started`
- `session_completed`
- `recording_uploaded`
- `ai_feedback_viewed`
- `achievement_earned`

## ♿ Accessibility

The app includes:
- ARIA labels on all interactive elements
- Keyboard navigation support
- Color contrast ratios meet WCAG AA
- Screen reader announcements
- Focus management in modals

## 🎯 Future Enhancements

**Phase 2:**
- Collaborative rooms with WebRTC
- Dance pose visualization
- Future-self duet feature
- Neural dance playback
- Export pack generation

**Phase 3:**
- Remix playground
- Haptic feedback on mobile
- Voice commands
- Social features
- Coaching marketplace

## 📞 Support

For questions or issues:
- GitHub Issues: [your-repo/issues]
- Discord: [your-discord-link]
- Email: support@micromuse.app

---

**Built with:** React, TypeScript, Vite, Tailwind CSS, React-Three-Fiber, Zustand, Framer Motion
