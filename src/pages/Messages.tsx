import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useConversations, useChat, Conversation, Message } from '@/hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Paperclip, Image, FileText, Film, ArrowLeft, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday } from 'date-fns';
import GlassCard from '@/components/GlassCard';

function ConversationList({ conversations, selected, onSelect }: {
  conversations: Conversation[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <MessageCircle className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-1">No conversations yet</h3>
        <p className="text-sm text-muted-foreground">Search for people and follow each other to start messaging</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2">
        {conversations.map(conv => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
              selected === conv.id ? 'bg-primary/10 text-primary' : 'hover:bg-accent/50'
            }`}
          >
            <Avatar className="w-10 h-10 shrink-0">
              <AvatarImage src={conv.otherUser?.avatar_url || ''} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                {conv.otherUser?.full_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{conv.otherUser?.full_name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">
                {conv.lastMessage?.message_type === 'text'
                  ? conv.lastMessage.content
                  : conv.lastMessage?.message_type === 'image' ? '📷 Image'
                  : conv.lastMessage?.message_type === 'video' ? '🎬 Video'
                  : conv.lastMessage?.message_type === 'file' ? '📎 File'
                  : 'No messages yet'}
              </p>
            </div>
            {conv.lastMessage && (
              <span className="text-[10px] text-muted-foreground shrink-0">
                {formatTime(conv.lastMessage.created_at)}
              </span>
            )}
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, 'HH:mm');
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d');
}

function MessageBubble({ msg, isOwn }: { msg: Message; isOwn: boolean }) {
  const renderContent = () => {
    switch (msg.message_type) {
      case 'image':
        return (
          <div>
            <img src={msg.file_url!} alt={msg.file_name || 'Image'} className="max-w-[240px] rounded-lg" />
            {msg.content && msg.content !== msg.file_name && <p className="mt-1 text-sm">{msg.content}</p>}
          </div>
        );
      case 'video':
        return (
          <div>
            <video src={msg.file_url!} controls className="max-w-[280px] rounded-lg" />
          </div>
        );
      case 'file':
        return (
          <a href={msg.file_url!} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
            <FileText className="w-8 h-8 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{msg.file_name || 'File'}</p>
              <p className="text-xs text-muted-foreground">{msg.file_type}</p>
            </div>
          </a>
        );
      default:
        return <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}
    >
      <div className={`max-w-[70%] px-3 py-2 rounded-2xl ${
        isOwn
          ? 'bg-primary text-primary-foreground rounded-br-sm'
          : 'bg-muted rounded-bl-sm'
      }`}>
        {renderContent()}
        <p className={`text-[10px] mt-1 ${isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
          {format(new Date(msg.created_at), 'HH:mm')}
        </p>
      </div>
    </motion.div>
  );
}

function ChatView({ conversationId, otherUser, onBack }: {
  conversationId: string;
  otherUser?: { full_name: string | null; avatar_url: string | null; username: string | null };
  onBack: () => void;
}) {
  const { user } = useAuth();
  const { messages, loading, sendMessage } = useChat(conversationId);
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim()) return;
    await sendMessage(text.trim());
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
    const fileUrl = urlData.publicUrl;

    let msgType = 'file';
    if (file.type.startsWith('image/')) msgType = 'image';
    else if (file.type.startsWith('video/')) msgType = 'video';

    await sendMessage(file.name, msgType, fileUrl, file.name, file.type);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center gap-3 p-4 border-b border-border/50">
        <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Avatar className="w-9 h-9">
          <AvatarImage src={otherUser?.avatar_url || ''} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
            {otherUser?.full_name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-sm">{otherUser?.full_name || 'User'}</p>
          <p className="text-xs text-muted-foreground">@{otherUser?.username || 'user'}</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-muted-foreground">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle className="w-12 h-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No messages yet. Say hello! 👋</p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} isOwn={msg.sender_id === user?.id} />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border/50">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip"
            onChange={handleFileUpload}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="shrink-0"
          >
            <Paperclip className="w-5 h-5" />
          </Button>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            className="flex-1"
            disabled={uploading}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!text.trim() || uploading}
            className="shrink-0 bg-primary"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        {uploading && <p className="text-xs text-muted-foreground mt-1">Uploading file...</p>}
      </div>
    </div>
  );
}

export default function Messages() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { conversations, loading } = useConversations();
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get('conversation'));
  const { user } = useAuth();

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

  return (
    <div className="h-[calc(100vh-2rem)] flex pt-2">
      {/* Conversation list */}
      <div className={`w-full md:w-80 border-r border-border/50 flex flex-col ${selectedId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-border/50">
          <h2 className="text-xl font-display font-bold">Messages</h2>
        </div>
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        ) : (
          <ConversationList conversations={conversations} selected={selectedId} onSelect={handleSelect} />
        )}
      </div>

      {/* Chat area */}
      <div className={`flex-1 flex flex-col ${!selectedId ? 'hidden md:flex' : 'flex'}`}>
        {selectedId && selectedConvo ? (
          <ChatView
            conversationId={selectedId}
            otherUser={selectedConvo.otherUser}
            onBack={handleBack}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <MessageCircle className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Select a conversation</h3>
            <p className="text-sm text-muted-foreground">Choose a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
