import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import ThreeScene from "@/components/ThreeScene";
import AuthenticatedHeader from "@/components/AuthenticatedHeader";
import AIChatbot from "@/components/AIChatbot";
import AppSidebar from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Pages
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import UpdatedOnboarding from "./pages/UpdatedOnboarding";
import Home from "./pages/Home";
import Challenge from "./pages/Challenge";
import Challenges from "./pages/Challenges";
import Achievements from "./pages/Achievements";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Settings from "./pages/Settings";
import YourWork from "./pages/YourWork";
import Leaderboard from "./pages/Leaderboard";
import Search from "./pages/Search";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-lg">Loading...</div></div>;
  return user ? <>{children}</> : <Navigate to="/" replace />;
}

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [hasHobbies, setHasHobbies] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const check = async () => {
      if (!user) { setChecking(false); return; }
      const { data } = await supabase.from('user_hobbies').select('id').eq('user_id', user.id).limit(1);
      setHasHobbies(data && data.length > 0);
      setChecking(false);
    };
    if (!authLoading && user) check();
    else if (!authLoading) setChecking(false);
  }, [user, authLoading]);

  if (authLoading || checking) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-lg">Loading...</div></div>;
  if (!user) return <Navigate to="/" replace />;
  if (hasHobbies === false && location.pathname !== '/onboarding') return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

function AuthenticatedRedirect() {
  const { user, loading: authLoading } = useAuth();
  const [hasHobbies, setHasHobbies] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      if (!user) { setChecking(false); return; }
      const { data } = await supabase.from('user_hobbies').select('id').eq('user_id', user.id).limit(1);
      setHasHobbies(data && data.length > 0);
      setChecking(false);
    };
    if (!authLoading && user) check();
    else if (!authLoading) setChecking(false);
  }, [user, authLoading]);

  if (authLoading || checking) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-lg">Loading...</div></div>;
  if (!user) return <Landing />;
  if (hasHobbies === false) return <Navigate to="/onboarding" replace />;
  return <Navigate to="/home" replace />;
}

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border/50 px-4 glass shrink-0 z-30">
            <SidebarTrigger className="mr-3" />
            <AuthenticatedHeader />
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

const App = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isOnboardingRoute = location.pathname === '/onboarding';

  if (loading) {
    return (
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-lg">Loading...</div>
        </div>
      </QueryClientProvider>
    );
  }

  const showFullUI = user && !isOnboardingRoute;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ThreeScene />
        {showFullUI ? (
          <AuthenticatedLayout>
            <AIChatbot />
            <Routes>
              <Route path="/" element={<AuthenticatedRedirect />} />
              <Route path="/home" element={<OnboardingGuard><Home /></OnboardingGuard>} />
              <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/challenge" element={<ProtectedRoute><Challenge /></ProtectedRoute>} />
              <Route path="/challenges" element={<ProtectedRoute><Challenges /></ProtectedRoute>} />
              <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/your-work" element={<ProtectedRoute><YourWork /></ProtectedRoute>} />
              <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthenticatedLayout>
        ) : (
          <Routes>
            <Route path="/" element={<AuthenticatedRedirect />} />
            <Route path="/auth" element={user ? <AuthenticatedRedirect /> : <Auth />} />
            <Route path="/onboarding" element={<ProtectedRoute><UpdatedOnboarding /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
