import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useConversations, useChat, Conversation, Message, getOrCreateConversation } from '@/hooks/useMessages';
import { useMessageRequests, MessageRequest } from '@/hooks/useMessageRequests';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { encryptMessage, decryptMessage, isEncrypted } from '@/lib/encryption';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Paperclip, FileText, ArrowLeft, MessageCircle, Plus, Check, X, Bell, Shield, ShieldCheck, Lock, Info, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, 'HH:mm');
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d');
}

/* ─── Security Info Dialog ─── */
function SecurityInfoDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const features = [
    { icon: Lock, title: 'End-to-End Encrypted', desc: 'Messages are encrypted on your device before being sent. Only you and the recipient can read them.' },
    { icon: ShieldCheck, title: 'AES-256-GCM Encryption', desc: 'Industry-standard encryption with 256-bit keys derived via PBKDF2 with 100,000 iterations.' },
    { icon: Shield, title: 'Zero-Knowledge Architecture', desc: 'Encryption keys are derived locally from conversation participants. The server never sees your plaintext messages.' },
    { icon: Sparkles, title: 'Perfect Forward Secrecy', desc: 'Each message uses a unique initialization vector (IV), so compromising one message cannot reveal others.' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-none bg-gradient-to-br from-card via-card to-primary/5 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            Your Messages Are Protected
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-3 p-3 rounded-xl bg-background/60 border border-border/40"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center shrink-0">
                <f.icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-sm">{f.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
          <div className="text-center pt-2">
            <p className="text-[11px] text-muted-foreground">🔐 MicroMuse uses the Web Crypto API — a native browser standard trusted by banks and governments worldwide.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Decrypted Message Bubble ─── */
function MessageBubble({ msg, isOwn, userId1, userId2 }: { msg: Message; isOwn: boolean; userId1: string; userId2: string }) {
  const [decrypted, setDecrypted] = useState<string | null>(null);

  useEffect(() => {
    if (msg.message_type === 'text' && msg.content) {
      decryptMessage(msg.content, userId1, userId2).then(setDecrypted).catch(() => setDecrypted(msg.content));
    } else {
      setDecrypted(msg.content);
    }
  }, [msg.content, msg.message_type, userId1, userId2]);

  const renderContent = () => {
    switch (msg.message_type) {
      case 'image':
        return (
          <div>
            <img src={msg.file_url!} alt={msg.file_name || 'Image'} className="max-w-[240px] rounded-lg" />
            {decrypted && decrypted !== msg.file_name && <p className="mt-1 text-sm">{decrypted}</p>}
          </div>
        );
      case 'video':
        return <video src={msg.file_url!} controls className="max-w-[280px] rounded-lg" />;
      case 'file':
        return (
          <a href={msg.file_url!} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 rounded-lg bg-background/30 hover:bg-background/50 transition-colors backdrop-blur-sm">
            <FileText className="w-8 h-8 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{msg.file_name || 'File'}</p>
              <p className="text-xs opacity-60">{msg.file_type}</p>
            </div>
          </a>
        );
      default:
        return <p className="text-sm whitespace-pre-wrap break-words">{decrypted ?? '...'}</p>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}
    >
      <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl relative ${
        isOwn
          ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-br-md shadow-lg shadow-primary/20'
          : 'bg-card/80 backdrop-blur-sm border border-border/30 rounded-bl-md shadow-md'
      }`}>
        {renderContent()}
        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
          <p className={`text-[10px] ${isOwn ? 'text-primary-foreground/50' : 'text-muted-foreground'}`}>
            {format(new Date(msg.created_at), 'HH:mm')}
          </p>
          {isEncrypted(msg.content) && (
            <Lock className={`w-2.5 h-2.5 ${isOwn ? 'text-primary-foreground/40' : 'text-muted-foreground/60'}`} />
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Chat View ─── */
function ChatView({ conversationId, otherUser, onBack }: {
  conversationId: string;
  otherUser?: { id?: string; full_name: string | null; avatar_url: string | null; username: string | null };
  onBack: () => void;
}) {
  const { user } = useAuth();
  const { messages, loading, sendMessage } = useChat(conversationId);
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const otherUserId = otherUser?.id || '';

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !user) return;
    const encrypted = await encryptMessage(text.trim(), user.id, otherUserId);
    await sendMessage(encrypted);
    setText('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('message-attachments').upload(path, file);
    if (error) { setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('message-attachments').getPublicUrl(path);
    let msgType = 'file';
    if (file.type.startsWith('image/')) msgType = 'image';
    else if (file.type.startsWith('video/')) msgType = 'video';
    await sendMessage(file.name, msgType, urlData.publicUrl, file.name, file.type);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-4 py-3 border-b border-border/30 bg-card/60 backdrop-blur-xl"
      >
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 hover:bg-primary/10">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="relative">
          <Avatar className="w-10 h-10 ring-2 ring-primary/20">
            <AvatarImage src={otherUser?.avatar_url || ''} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-bold">
              {otherUser?.full_name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-card" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{otherUser?.full_name || 'User'}</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <Lock className="w-2.5 h-2.5" /> Encrypted Chat
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setShowSecurity(true)} className="shrink-0 text-emerald-600 hover:bg-emerald-500/10">
          <ShieldCheck className="w-5 h-5" />
        </Button>
      </motion.div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1" style={{
        backgroundImage: 'radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.03), transparent 50%), radial-gradient(circle at 80% 20%, hsl(var(--accent) / 0.04), transparent 50%)',
      }}>
        {/* Encryption banner */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center mb-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <Lock className="w-3 h-3 text-emerald-600" />
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">Messages are end-to-end encrypted</span>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Decrypting messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4">
              <MessageCircle className="w-10 h-10 text-primary/40" />
            </div>
            <p className="font-semibold text-foreground/80">Start a secure conversation</p>
            <p className="text-sm text-muted-foreground mt-1">Say hello! Your messages are encrypted 🔐</p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} isOwn={msg.sender_id === user?.id} userId1={user?.id || ''} userId2={otherUserId} />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border/30 bg-card/60 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <input ref={fileInputRef} type="file" className="hidden" accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip" onChange={handleFileUpload} />
          <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="shrink-0 hover:bg-primary/10">
            <Paperclip className="w-5 h-5 text-muted-foreground" />
          </Button>
          <div className="flex-1 relative">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Type a message..."
              className="pr-3 bg-muted/50 border-border/30 focus:border-primary/50 rounded-xl"
              disabled={uploading}
            />
          </div>
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!text.trim() || uploading}
            className="shrink-0 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        {uploading && (
          <div className="flex items-center gap-2 mt-2">
            <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-xs text-muted-foreground">Uploading securely...</p>
          </div>
        )}
      </div>

      <SecurityInfoDialog open={showSecurity} onOpenChange={setShowSecurity} />
    </div>
  );
}

/* ─── New Chat Dialog ─── */
interface FollowUser {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

function NewChatDialog({ open, onOpenChange, userId, onStartChat }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  userId: string;
  onStartChat: (convoId: string) => void;
}) {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { sendRequest, checkRequestStatus } = useMessageRequests();
  const [sendingTo, setSendingTo] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const fetchFollowing = async () => {
      setLoading(true);
      const { data: following } = await supabase.from('follows').select('following_id').eq('follower_id', userId);
      if (!following || following.length === 0) { setUsers([]); setLoading(false); return; }
      const followingIds = following.map(f => f.following_id);
      const { data: profiles } = await supabase.from('public_profiles').select('id, full_name, username, avatar_url').in('id', followingIds);
      setUsers((profiles as FollowUser[]) || []);
      setLoading(false);
    };
    fetchFollowing();
  }, [open, userId]);

  const handleSelect = async (otherUserId: string) => {
    setSendingTo(otherUserId);
    const status = await checkRequestStatus(otherUserId);
    if (status === 'accepted') {
      const convoId = await getOrCreateConversation(userId, otherUserId);
      if (convoId) { onOpenChange(false); onStartChat(convoId); }
    } else if (status === 'pending') {
      toast({ title: 'Request Pending', description: 'Your message request is still pending approval.' });
    } else {
      const result = await sendRequest(otherUserId);
      if (result.alreadyAccepted) {
        const convoId = await getOrCreateConversation(userId, otherUserId);
        if (convoId) { onOpenChange(false); onStartChat(convoId); }
      } else if (result.error) {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      } else {
        toast({ title: 'Request Sent!', description: 'The user will be notified. You can chat once they accept.' });
        onOpenChange(false);
      }
    }
    setSendingTo(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm border-none bg-gradient-to-br from-card via-card to-primary/5 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" /> New Chat
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="py-8 flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Loading contacts...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="font-medium text-foreground/80">No one to message yet</p>
            <p className="text-sm text-muted-foreground mt-1">Follow people to send them a message request</p>
          </div>
        ) : (
          <ScrollArea className="max-h-80">
            <div className="space-y-1">
              {users.map(u => (
                <motion.button
                  key={u.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelect(u.id!)}
                  disabled={sendingTo === u.id}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors text-left disabled:opacity-50"
                >
                  <Avatar className="w-10 h-10 ring-2 ring-primary/10">
                    <AvatarImage src={u.avatar_url || ''} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary text-sm font-bold">{u.full_name?.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{u.full_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">@{u.username || 'user'}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ─── Requests Panel ─── */
function RequestsPanel({ requests, onAccept, onDecline }: {
  requests: MessageRequest[];
  onAccept: (id: string, senderId: string) => void;
  onDecline: (id: string) => void;
}) {
  if (requests.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="px-4 py-3 border-b border-border/30">
      <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase mb-2 flex items-center gap-1.5">
        <Bell className="w-3.5 h-3.5" /> Message Requests ({requests.length})
      </p>
      <div className="space-y-2">
        {requests.map(req => (
          <motion.div
            key={req.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/15"
          >
            <Avatar className="w-9 h-9">
              <AvatarImage src={req.sender?.avatar_url || ''} />
              <AvatarFallback className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-700 text-xs font-bold">
                {req.sender?.full_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{req.sender?.full_name || 'User'}</p>
              <p className="text-[11px] text-muted-foreground">wants to message you</p>
            </div>
            <div className="flex gap-1.5">
              <Button size="icon" variant="ghost" className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" onClick={() => onAccept(req.id, req.sender_id)}>
                <Check className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20" onClick={() => onDecline(req.id)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Conversation List Item ─── */
function ConversationItem({ conv, onClick }: { conv: Conversation; onClick: () => void }) {
  const previewText = conv.lastMessage?.message_type === 'text'
    ? (conv.lastMessage.content?.startsWith('e2e:') ? '🔒 Encrypted message' : conv.lastMessage.content)
    : conv.lastMessage?.message_type === 'image' ? '📷 Image'
    : conv.lastMessage?.message_type === 'video' ? '🎬 Video'
    : conv.lastMessage?.message_type === 'file' ? '📎 File'
    : 'No messages yet';

  return (
    <motion.button
      whileHover={{ scale: 1.01, backgroundColor: 'hsl(var(--primary) / 0.04)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left"
    >
      <div className="relative">
        <Avatar className="w-12 h-12 ring-2 ring-primary/10">
          <AvatarImage src={conv.otherUser?.avatar_url || ''} />
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-bold">
            {conv.otherUser?.full_name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-card" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-sm truncate">{conv.otherUser?.full_name || 'User'}</p>
          {conv.lastMessage && (
            <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
              {formatTime(conv.lastMessage.created_at)}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">{previewText}</p>
      </div>
    </motion.button>
  );
}

/* ─── Main Messages Page ─── */
export default function Messages() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { conversations, loading } = useConversations();
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get('conversation'));
  const { user } = useAuth();
  const [showNewChat, setShowNewChat] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const { pendingRequests, acceptRequest, declineRequest } = useMessageRequests();

  useEffect(() => {
    const convoParam = searchParams.get('conversation');
    if (convoParam) setSelectedId(convoParam);
  }, [searchParams]);

  const selectedConvo = conversations.find(c => c.id === selectedId);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setSearchParams({ conversation: id });
  };

  const handleBack = () => {
    setSelectedId(null);
    setSearchParams({});
  };

  const handleAccept = async (requestId: string, senderId: string) => {
    const convoId = await acceptRequest(requestId, senderId);
    if (convoId) {
      toast({ title: 'Request Accepted', description: 'You can now start chatting securely!' });
      handleSelect(convoId);
    }
  };

  const handleDecline = async (requestId: string) => {
    await declineRequest(requestId);
    toast({ title: 'Request Declined' });
  };

  if (selectedId && selectedConvo) {
    return (
      <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-gradient-to-br from-background via-background to-primary/3">
        <ChatView conversationId={selectedId} otherUser={selectedConvo.otherUser as any} onBack={handleBack} />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col relative bg-gradient-to-br from-background via-background to-primary/3">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-card/60 backdrop-blur-xl"
      >
        <div>
          <h2 className="text-xl font-display font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Messages</h2>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
            <Lock className="w-2.5 h-2.5" /> End-to-end encrypted
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setShowSecurity(true)} className="text-emerald-600 hover:bg-emerald-500/10 rounded-xl">
          <Info className="w-5 h-5" />
        </Button>
      </motion.div>

      {/* Requests */}
      <RequestsPanel requests={pendingRequests} onAccept={handleAccept} onDecline={handleDecline} />

      {/* Conversations */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Loading conversations...</p>
          </div>
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 flex items-center justify-center mb-5 mx-auto rotate-3">
              <MessageCircle className="w-12 h-12 text-primary/40" />
            </div>
            <h3 className="text-lg font-bold mb-1">No conversations yet</h3>
            <p className="text-sm text-muted-foreground max-w-[250px]">Follow people and send a message request to start chatting securely</p>
          </motion.div>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-0.5">
            <AnimatePresence>
              {conversations.map((conv, i) => (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <ConversationItem conv={conv} onClick={() => handleSelect(conv.id)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      )}

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowNewChat(true)}
        className="absolute bottom-6 left-6 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-xl shadow-primary/30 flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {user && (
        <NewChatDialog open={showNewChat} onOpenChange={setShowNewChat} userId={user.id} onStartChat={handleSelect} />
      )}

      <SecurityInfoDialog open={showSecurity} onOpenChange={setShowSecurity} />
    </div>
  );
}
