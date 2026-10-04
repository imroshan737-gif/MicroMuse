import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Image, Loader2, User, Trash2, MessageSquare, Mic, Square, Volume2, VolumeX, Play, Pause } from 'lucide-react';
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
          content: `Something went wrong: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
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

  const suggestions = [
    { label: 'Challenge Tips', prompt: 'Give me tips to complete my current challenges effectively.' },
    { label: 'Voice Chat', prompt: '' },
    { label: 'Language', prompt: 'Which languages can you understand and reply in?' },
  ];

  const iconBtn = 'mk-icon-btn inline-flex items-center justify-center w-8 h-8 rounded-[10px] transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26422]';

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open Miko AI Assistant"
          className="mk-launcher fixed bottom-6 right-6 z-50 w-14 h-14 rounded-[12px] flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#F26422]"
        >
          <MessageSquare className="w-6 h-6" strokeWidth={1.75} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Miko AI Assistant"
          className="mk-panel fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-3rem)] rounded-[12px] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="mk-header flex items-center justify-between px-4 py-3">
            <div>
              <h3 className="mk-text text-[15px] font-semibold leading-tight">Miko</h3>
              <p className="mk-sub text-xs mt-0.5">AI Assistant{voiceRepliesEnabled ? ' · Voice replies on' : ''}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setVoiceRepliesEnabled((v) => !v)}
                aria-label={voiceRepliesEnabled ? 'Mute voice replies' : 'Enable voice replies'}
                title={voiceRepliesEnabled ? 'Mute voice replies' : 'Enable voice replies'}
                className={iconBtn}
              >
                {voiceRepliesEnabled ? <Volume2 className="w-4 h-4" strokeWidth={1.75} /> : <VolumeX className="w-4 h-4" strokeWidth={1.75} />}
              </button>
              <button onClick={clearChat} aria-label="Clear conversation" title="Clear conversation" className={iconBtn}>
                <Trash2 className="w-4 h-4" strokeWidth={1.75} />
              </button>
              <button onClick={() => setIsOpen(false)} aria-label="Close assistant" title="Close" className={iconBtn}>
                <X className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 bg-[#FFFFFF]" ref={scrollRef}>
            <div className="p-5">
              {messages.length === 0 && (
                <div className="py-6">
                  <h4 className="mk-text text-base font-semibold">How can I help you today?</h4>
                  <p className="mk-sub text-sm mt-2 leading-relaxed">
                    Ask about your challenges, share an image for feedback, or use the microphone to speak in any language.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-5">
                    {suggestions.map((s) => (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => {
                          if (s.label === 'Voice Chat') { startRecording(); return; }
                          setInput(s.prompt);
                          inputRef.current?.focus();
                        }}
                        className="mk-chip text-[13px] font-medium px-3 py-1.5 rounded-[10px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26422]"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                    <div
                      className={cn(
                        'max-w-[85%] rounded-[12px] px-4 py-3',
                        message.role === 'user' ? 'mk-user' : 'mk-assistant'
                      )}
                    >
                      {message.image && (
                        <img src={message.image} alt="Uploaded" className="max-w-full rounded-[10px] mb-2 max-h-32 object-cover" />
                      )}
                      {message.isVoiceInput && (
                        <div className="flex items-center gap-1 text-[11px] font-medium opacity-80 mb-1">
                          <Mic className="w-3 h-3" strokeWidth={1.75} /> Voice message
                        </div>
                      )}
                      <div className="text-sm leading-relaxed prose prose-sm prose-headings:text-base prose-headings:font-semibold prose-headings:mt-2 prose-headings:mb-1 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 max-w-none [&_*]:text-inherit">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                      {message.role === 'assistant' && message.content && (
                        <button
                          onClick={() => togglePlayMessage(index)}
                          className="mk-listen mt-2 inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-[8px] transition-colors"
                          aria-label={playingMessageIdx === index ? 'Pause audio' : 'Play audio'}
                        >
                          {playingMessageIdx === index ? (
                            <><Pause className="w-3 h-3" strokeWidth={1.75} /> Pause</>
                          ) : (
                            <><Play className="w-3 h-3" strokeWidth={1.75} /> Listen</>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                  <div className="flex justify-start">
                    <div className="mk-assistant rounded-[12px] px-4 py-3 flex items-center gap-2 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.75} />
                      <span className="mk-sub">Thinking…</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          {/* Selected Image Preview */}
          {selectedImage && (
            <div className="mk-divider px-4 py-2 bg-[#FFFFFF]">
              <div className="relative inline-block">
                <img src={selectedImage} alt="Selected" className="h-16 rounded-[10px] object-cover border border-[#DCD7CE]" />
                <button
                  onClick={() => setSelectedImage(null)}
                  aria-label="Remove image"
                  className="mk-remove absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3" strokeWidth={2} />
                </button>
              </div>
            </div>
          )}

          {/* Recording / Transcribing banner */}
          {(isRecording || isTranscribing) && (
            <div className="mk-divider mk-header px-4 py-2" role="status" aria-live="polite">
              <div className="flex items-center justify-center gap-2 text-xs font-medium mk-text">
                {isRecording ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-[#F26422]" />
                    Recording — tap the microphone again to send
                  </>
                ) : (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" strokeWidth={1.75} />
                    Transcribing audio…
                  </>
                )}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="mk-divider p-3 bg-[#FFFFFF]">
            <div className="flex items-center gap-2">
              <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isRecording || isTranscribing}
                aria-label="Attach image"
                title="Attach image"
                className={cn(iconBtn, 'w-10 h-10 flex-shrink-0')}
              >
                <Image className="w-5 h-5" strokeWidth={1.75} />
              </button>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isLoading || isTranscribing}
                aria-label={isRecording ? 'Stop recording' : 'Record voice message'}
                title={isRecording ? 'Stop recording' : 'Record voice message'}
                className={cn(iconBtn, 'w-10 h-10 flex-shrink-0', isRecording && 'mk-recording')}
              >
                {isRecording ? <Square className="w-4 h-4" strokeWidth={1.75} /> : <Mic className="w-5 h-5" strokeWidth={1.75} />}
              </button>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder={isRecording ? 'Listening…' : 'Ask Miko a question…'}
                aria-label="Message"
                className="mk-input flex-1 min-w-0 h-10 px-3 text-sm rounded-[10px]"
                disabled={isLoading || isRecording || isTranscribing}
              />
              <button
                onClick={() => sendMessage()}
                disabled={(!input.trim() && !selectedImage) || isLoading || isRecording || isTranscribing}
                aria-label="Send message"
                className="mk-send w-10 h-10 flex-shrink-0 rounded-[10px] flex items-center justify-center transition-colors disabled:opacity-40"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.75} /> : <Send className="w-4 h-4" strokeWidth={1.75} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
