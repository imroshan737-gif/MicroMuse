import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Image, Loader2, User, Trash2, Heart, Mic, Square, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  audioUrl?: string;
  isVoiceInput?: boolean;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

// Cute Miko mascot SVG component
const MikoMascot = ({ className, animate = false }: { className?: string; animate?: boolean }) => (
  <motion.svg
    viewBox="0 0 100 100"
    className={className}
    animate={animate ? { y: [0, -3, 0] } : undefined}
    transition={animate ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : undefined}
  >
    <circle cx="50" cy="50" r="40" fill="url(#mikoGradient)" />
    <circle cx="30" cy="55" r="8" fill="#FFB6C1" opacity="0.6" />
    <circle cx="70" cy="55" r="8" fill="#FFB6C1" opacity="0.6" />
    <ellipse cx="35" cy="45" rx="6" ry="8" fill="#2D1B4E" />
    <ellipse cx="65" cy="45" rx="6" ry="8" fill="#2D1B4E" />
    <circle cx="37" cy="43" r="2" fill="white" />
    <circle cx="67" cy="43" r="2" fill="white" />
    <path d="M 40 60 Q 50 70 60 60" stroke="#2D1B4E" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M 15 25 L 25 45 L 35 25 Z" fill="url(#mikoGradient)" />
    <path d="M 85 25 L 75 45 L 65 25 Z" fill="url(#mikoGradient)" />
    <path d="M 20 28 L 26 40 L 32 28 Z" fill="#FFB6C1" />
    <path d="M 80 28 L 74 40 L 68 28 Z" fill="#FFB6C1" />
    <circle cx="85" cy="35" r="3" fill="#FFD700" opacity="0.8" />
    <circle cx="15" cy="35" r="2" fill="#FFD700" opacity="0.8" />
    <defs>
      <linearGradient id="mikoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(280, 70%, 60%)" />
        <stop offset="100%" stopColor="hsl(320, 70%, 55%)" />
      </linearGradient>
    </defs>
  </motion.svg>
);

// Helper: ArrayBuffer → base64 (chunked, no stack overflow)
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)));
  }
  return btoa(binary);
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voiceRepliesEnabled, setVoiceRepliesEnabled] = useState(true);
  const [playingMessageIdx, setPlayingMessageIdx] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  // Cleanup mic & audio on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      currentAudioRef.current?.pause();
    };
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // ---- Recording ----
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;

      // Pick the best supported mime type
      const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
      const mimeType = candidates.find((t) => MediaRecorder.isTypeSupported(t)) || '';
      const mr = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mr.onstop = handleRecordingStop;
      mr.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Mic error:', err);
      toast.error('Mic access denied. Please allow microphone permission.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setIsRecording(false);
  };

  const handleRecordingStop = async () => {
    const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
    const blob = new Blob(audioChunksRef.current, { type: mimeType });
    audioChunksRef.current = [];

    if (blob.size < 800) {
      toast.error('Recording too short. Try again.');
      return;
    }

    setIsTranscribing(true);
    try {
      const buffer = await blob.arrayBuffer();
      const base64 = arrayBufferToBase64(buffer);

      const { data, error } = await supabase.functions.invoke('voice-transcribe', {
        body: { audio: base64, mimeType },
      });

      if (error) throw error;
      const transcript = (data?.text || '').trim();
      if (!transcript) {
        toast.error("Couldn't catch that. Please try again.");
        return;
      }
      // Send the transcript as a user message, marked as voice input → reply will also be spoken
      await sendMessage(transcript, true);
    } catch (err) {
      console.error('Transcribe error:', err);
      toast.error('Transcription failed. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  // ---- TTS playback ----
  const speakText = async (text: string, messageIdx: number) => {
    try {
      // Stop any currently playing audio
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }

      const { data, error } = await supabase.functions.invoke('voice-tts', { body: { text } });
      if (error) throw error;
      const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;

      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;
      setPlayingMessageIdx(messageIdx);
      audio.onended = () => {
        setPlayingMessageIdx(null);
        currentAudioRef.current = null;
      };
      audio.onerror = () => {
        setPlayingMessageIdx(null);
        currentAudioRef.current = null;
      };
      // Cache the URL on the message so user can replay
      setMessages((prev) => {
        const updated = [...prev];
        if (updated[messageIdx]) updated[messageIdx] = { ...updated[messageIdx], audioUrl };
        return updated;
      });
      await audio.play();
    } catch (err) {
      console.error('TTS error:', err);
      toast.error('Voice playback failed.');
      setPlayingMessageIdx(null);
    }
  };

  const togglePlayMessage = async (idx: number) => {
    const msg = messages[idx];
    if (!msg) return;
    if (playingMessageIdx === idx) {
      currentAudioRef.current?.pause();
      currentAudioRef.current = null;
      setPlayingMessageIdx(null);
      return;
    }
    if (msg.audioUrl) {
      if (currentAudioRef.current) currentAudioRef.current.pause();
      const audio = new Audio(msg.audioUrl);
      currentAudioRef.current = audio;
      setPlayingMessageIdx(idx);
      audio.onended = () => { setPlayingMessageIdx(null); currentAudioRef.current = null; };
      await audio.play();
    } else {
      await speakText(msg.content, idx);
    }
  };

  // ---- Send message (text or voice) ----
  const sendMessage = async (overrideText?: string, isVoice = false) => {
    const textToSend = overrideText ?? input.trim();
    if ((!textToSend && !selectedImage) || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: textToSend || (selectedImage ? 'Please analyze this image.' : ''),
      image: selectedImage || undefined,
      isVoiceInput: isVoice,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!overrideText) setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    const apiMessages = [...messages, userMessage].map((msg) => {
      if (msg.image) {
        return {
          role: msg.role,
          content: [
            { type: 'text', text: msg.content },
            { type: 'image_url', image_url: { url: msg.image } },
          ],
        };
      }
      return { role: msg.role, content: msg.content };
    });

    let assistantContent = '';
    let assistantIdx = -1;

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: apiMessages,
          hasImage: userMessage.image !== undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No response body');

      setMessages((prev) => {
        const updated = [...prev, { role: 'assistant' as const, content: '' }];
        assistantIdx = updated.length - 1;
        return updated;
      });

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || !line.trim()) continue;
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const updated = [...prev];
                if (updated[updated.length - 1]?.role === 'assistant') {
                  updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                }
                return updated;
              });
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // Auto-speak: always reply with both text + audio when voice replies enabled
      // Or specifically when input was voice
      if ((voiceRepliesEnabled || isVoice) && assistantContent.trim()) {
        const finalIdx = assistantIdx >= 0 ? assistantIdx : messages.length;
        // small defer so message renders first
        setTimeout(() => speakText(assistantContent, finalIdx), 100);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev.filter((m) => m.role !== 'assistant' || m.content !== ''),
        {
          role: 'assistant',
          content: `Oops! Something went wrong 😿 ${error instanceof Error ? error.message : 'Unknown error'}. Let's try again!`,
        },
      ]);
    } finally {
      setIsLoading(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  const clearChat = () => {
    currentAudioRef.current?.pause();
    currentAudioRef.current = null;
    setPlayingMessageIdx(null);
    setMessages([]);
    setSelectedImage(null);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 180 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 group"
          >
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 blur-lg opacity-60"
              animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.8, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-0.5 shadow-2xl">
              <div className="w-full h-full rounded-full bg-background/90 flex items-center justify-center overflow-hidden">
                <MikoMascot className="w-12 h-12" animate />
              </div>
            </div>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-[10px] font-bold text-white shadow-lg"
            >
              Hi! ✨
            </motion.span>
            <motion.div
              className="absolute -left-2 top-0"
              animate={{ y: [-5, 5, -5], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-primary/30 bg-background"
          >
            {/* Header */}
            <div className="relative p-4 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400">
              <div className="absolute top-2 left-2 w-20 h-20 bg-white/10 rounded-full blur-xl" />
              <div className="absolute bottom-0 right-10 w-16 h-16 bg-white/10 rounded-full blur-lg" />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <MikoMascot className="w-10 h-10" />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-white text-lg flex items-center gap-2">
                      Miko
                      <motion.span
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                      >
                        ✨
                      </motion.span>
                    </h3>
                    <p className="text-xs text-white/80 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      {voiceRepliesEnabled ? 'Voice on · 99+ languages' : 'Your creative companion'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setVoiceRepliesEnabled((v) => !v)}
                    title={voiceRepliesEnabled ? 'Mute voice replies' : 'Enable voice replies'}
                    className="text-white/70 hover:text-white hover:bg-white/20 rounded-xl"
                  >
                    {voiceRepliesEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearChat}
                    className="text-white/70 hover:text-white hover:bg-white/20 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="text-white/70 hover:text-white hover:bg-white/20 rounded-xl"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <MikoMascot className="w-24 h-24 mx-auto mb-4" animate />
                  <h4 className="text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                    Hiii! I'm Miko~ 💕
                  </h4>
                  <p className="text-sm text-muted-foreground mt-2 max-w-[280px] mx-auto">
                    Type, share images, or tap the mic to talk in any language~ 🎤📸
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {['💡 Challenge tips', '🎤 Voice chat', '🌍 Any language'].map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-xs rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              <div className="space-y-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn('flex gap-3', message.role === 'user' ? 'flex-row-reverse' : '')}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={cn(
                        'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md',
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                          : 'bg-gradient-to-br from-purple-500 to-pink-500'
                      )}
                    >
                      {message.role === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <MikoMascot className="w-6 h-6" />
                      )}
                    </motion.div>
                    <div
                      className={cn(
                        'max-w-[75%] rounded-2xl px-4 py-3 shadow-sm',
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-tr-sm'
                          : 'bg-card border border-border/50 rounded-tl-sm'
                      )}
                    >
                      {message.image && (
                        <img
                          src={message.image}
                          alt="Uploaded"
                          className="max-w-full rounded-xl mb-2 max-h-32 object-cover"
                        />
                      )}
                      {message.isVoiceInput && (
                        <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider opacity-70 mb-1">
                          <Mic className="w-3 h-3" /> Voice
                        </div>
                      )}
                      <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert prose-headings:text-base prose-headings:font-bold prose-headings:mt-2 prose-headings:mb-1 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 max-w-none">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                      {message.role === 'assistant' && message.content && (
                        <button
                          onClick={() => togglePlayMessage(index)}
                          className="mt-2 inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 transition-colors"
                          title={playingMessageIdx === index ? 'Pause' : 'Play voice'}
                        >
                          {playingMessageIdx === index ? (
                            <><Pause className="w-3 h-3" /> Pause</>
                          ) : (
                            <><Play className="w-3 h-3" /> Listen</>
                          )}
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}

                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                        <Loader2 className="w-4 h-4 text-white" />
                      </motion.div>
                    </div>
                    <div className="bg-card border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                      <div className="flex gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Selected Image Preview */}
            {selectedImage && (
              <div className="px-4 py-2 border-t border-border/30">
                <div className="relative inline-block">
                  <img src={selectedImage} alt="Selected" className="h-16 rounded-xl object-cover shadow-md" />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedImage(null)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full flex items-center justify-center shadow-md"
                  >
                    <X className="w-3 h-3" />
                  </motion.button>
                </div>
              </div>
            )}

            {/* Recording / Transcribing banner */}
            {(isRecording || isTranscribing) && (
              <div className="px-4 py-2 border-t border-border/30 bg-gradient-to-r from-red-500/10 to-pink-500/10">
                <div className="flex items-center justify-center gap-2 text-xs">
                  {isRecording ? (
                    <>
                      <motion.span
                        className="w-2 h-2 rounded-full bg-red-500"
                        animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      <span className="font-medium text-red-500">Recording... tap mic again to send</span>
                    </>
                  ) : (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin text-purple-500" />
                      <span className="font-medium text-purple-500">Transcribing audio...</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-border/30 bg-background/50 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isRecording || isTranscribing}
                    className="flex-shrink-0 rounded-xl hover:bg-purple-500/10"
                    title="Attach image"
                  >
                    <Image className="w-5 h-5 text-purple-500" />
                  </Button>
                </motion.div>

                {/* Mic button — right next to image button */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isLoading || isTranscribing}
                    className={cn(
                      'flex-shrink-0 rounded-xl relative',
                      isRecording
                        ? 'bg-red-500/20 hover:bg-red-500/30'
                        : 'hover:bg-pink-500/10'
                    )}
                    title={isRecording ? 'Stop recording' : 'Tap to record voice'}
                  >
                    {isRecording ? (
                      <Square className="w-4 h-4 text-red-500 fill-red-500" />
                    ) : (
                      <Mic className="w-5 h-5 text-pink-500" />
                    )}
                    {isRecording && (
                      <motion.span
                        className="absolute inset-0 rounded-xl border-2 border-red-500"
                        animate={{ scale: [1, 1.15, 1], opacity: [0.8, 0, 0.8] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                      />
                    )}
                  </Button>
                </motion.div>

                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder={isRecording ? 'Listening...' : 'Chat with Miko~ ✨'}
                  className="flex-1 rounded-xl border-border/50 bg-background/80 focus:border-purple-500/50 focus:ring-purple-500/20"
                  disabled={isLoading || isRecording || isTranscribing}
                />
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => sendMessage()}
                    disabled={(!input.trim() && !selectedImage) || isLoading || isRecording || isTranscribing}
                    size="icon"
                    className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:opacity-90 flex-shrink-0 rounded-xl shadow-lg"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
