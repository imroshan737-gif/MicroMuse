import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Image, Loader2, User, Trash2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
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
    {/* Face */}
    <circle cx="50" cy="50" r="40" fill="url(#mikoGradient)" />
    {/* Blush */}
    <circle cx="30" cy="55" r="8" fill="#FFB6C1" opacity="0.6" />
    <circle cx="70" cy="55" r="8" fill="#FFB6C1" opacity="0.6" />
    {/* Eyes */}
    <ellipse cx="35" cy="45" rx="6" ry="8" fill="#2D1B4E" />
    <ellipse cx="65" cy="45" rx="6" ry="8" fill="#2D1B4E" />
    {/* Eye sparkles */}
    <circle cx="37" cy="43" r="2" fill="white" />
    <circle cx="67" cy="43" r="2" fill="white" />
    {/* Cute smile */}
    <path d="M 40 60 Q 50 70 60 60" stroke="#2D1B4E" strokeWidth="3" fill="none" strokeLinecap="round" />
    {/* Cat ears */}
    <path d="M 15 25 L 25 45 L 35 25 Z" fill="url(#mikoGradient)" />
    <path d="M 85 25 L 75 45 L 65 25 Z" fill="url(#mikoGradient)" />
    {/* Inner ears */}
    <path d="M 20 28 L 26 40 L 32 28 Z" fill="#FFB6C1" />
    <path d="M 80 28 L 74 40 L 68 28 Z" fill="#FFB6C1" />
    {/* Sparkle accessories */}
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

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const sendMessage = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim() || (selectedImage ? 'Please analyze this image.' : ''),
      image: selectedImage || undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    const apiMessages = [...messages, userMessage].map(msg => {
      if (msg.image) {
        return {
          role: msg.role,
          content: [
            { type: 'text', text: msg.content },
            { type: 'image_url', image_url: { url: msg.image } }
          ]
        };
      }
      return { role: msg.role, content: msg.content };
    });

    let assistantContent = '';

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

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

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
              setMessages(prev => {
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
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev.filter(m => m.role !== 'assistant' || m.content !== ''),
        {
          role: 'assistant',
          content: `Oops! Something went wrong 😿 ${error instanceof Error ? error.message : 'Unknown error'}. Let's try again!`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSelectedImage(null);
  };

  return (
    <>
      {/* Floating Chat Button with Miko */}
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
            {/* Glow ring */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 blur-lg opacity-60"
              animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.8, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            {/* Button container */}
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-0.5 shadow-2xl">
              <div className="w-full h-full rounded-full bg-background/90 flex items-center justify-center overflow-hidden">
                <MikoMascot className="w-12 h-12" animate />
              </div>
            </div>
            {/* Notification badge */}
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-[10px] font-bold text-white shadow-lg"
            >
              Hi! ✨
            </motion.span>
            {/* Floating hearts */}
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
            className="fixed bottom-6 right-6 z-50 w-[400px] h-[580px] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            style={{
              background: 'linear-gradient(145deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
            }}
          >
            {/* Header */}
            <div className="relative p-4 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400">
              {/* Decorative circles */}
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
                      Your creative companion
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
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
                    I'm here to help with your hobbies, challenges, and anything creative! Share images too~ 📸
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {['💡 Challenge tips', '🎨 Art feedback', '📚 Learning help'].map((tag) => (
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
                    className={cn(
                      'flex gap-3',
                      message.role === 'user' ? 'flex-row-reverse' : ''
                    )}
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
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    </div>
                  </motion.div>
                ))}
                
                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
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
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="h-16 rounded-xl object-cover shadow-md"
                  />
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
                    className="flex-shrink-0 rounded-xl hover:bg-purple-500/10"
                  >
                    <Image className="w-5 h-5 text-purple-500" />
                  </Button>
                </motion.div>
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Chat with Miko~ ✨"
                  className="flex-1 rounded-xl border-border/50 bg-background/80 focus:border-purple-500/50 focus:ring-purple-500/20"
                  disabled={isLoading}
                />
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={sendMessage}
                    disabled={(!input.trim() && !selectedImage) || isLoading}
                    size="icon"
                    className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:opacity-90 flex-shrink-0 rounded-xl shadow-lg"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
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
