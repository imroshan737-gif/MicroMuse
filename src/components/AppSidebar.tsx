import { Search, MessageCircle } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { Sparkles } from 'lucide-react';

const navItems = [
  { title: 'Search', url: '/search', icon: Search },
  { title: 'Messages', url: '/messages', icon: MessageCircle },
];

export default function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchUnread = async () => {
      const { data: convos } = await supabase
        .from('conversations')
        .select('id')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (convos && convos.length > 0) {
        const convoIds = convos.map(c => c.id);
        const { count } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .in('conversation_id', convoIds)
          .neq('sender_id', user.id)
          .eq('is_read', false);
        setUnreadCount(count || 0);
      }
    };

    fetchUnread();

    const channel = supabase
      .channel('unread-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        fetchUnread();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50 bg-background/95 backdrop-blur-xl">
      <SidebarHeader className="p-4">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/home')}
        >
          <Sparkles className="w-6 h-6 text-primary animate-pulse-glow shrink-0" />
          {!collapsed && (
            <span className="text-xl font-display font-bold gradient-text">
              MicroMuse
            </span>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-accent/50"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <div className="relative">
                        <item.icon className="w-5 h-5 shrink-0" />
                        {item.title === 'Messages' && unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </div>
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
