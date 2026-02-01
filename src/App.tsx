import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import ThreeScene from "@/components/ThreeScene";
import Header from "@/components/Header";
import AIChatbot from "@/components/AIChatbot";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Pages
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import UpdatedOnboarding from "./pages/UpdatedOnboarding";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import Challenge from "./pages/Challenge";
import Challenges from "./pages/Challenges";
import Achievements from "./pages/Achievements";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Settings from "./pages/Settings";
import YourWork from "./pages/YourWork";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/" replace />;
}

// Component to check if user has completed onboarding and redirect accordingly
function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [hasHobbies, setHasHobbies] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) {
        setChecking(false);
        return;
      }

      const { data: userHobbies } = await supabase
        .from('user_hobbies')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      setHasHobbies(userHobbies && userHobbies.length > 0);
      setChecking(false);
    };

    if (!authLoading && user) {
      checkOnboarding();
    } else if (!authLoading) {
      setChecking(false);
    }
  }, [user, authLoading]);

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If user hasn't completed onboarding, redirect to onboarding
  if (hasHobbies === false && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

// Root redirect component that checks onboarding status
function AuthenticatedRedirect() {
  const { user, loading: authLoading } = useAuth();
  const [hasHobbies, setHasHobbies] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) {
        setChecking(false);
        return;
      }

      const { data: userHobbies } = await supabase
        .from('user_hobbies')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      setHasHobbies(userHobbies && userHobbies.length > 0);
      setChecking(false);
    };

    if (!authLoading && user) {
      checkOnboarding();
    } else if (!authLoading) {
      setChecking(false);
    }
  }, [user, authLoading]);

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Landing />;
  }

  // Redirect based on onboarding status
  if (hasHobbies === false) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Navigate to="/home" replace />;
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
  
  // Hide header and chatbot during onboarding
  const showFullUI = user && !isOnboardingRoute;
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ThreeScene />
        {showFullUI && <Header />}
        {showFullUI && <AIChatbot />}
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<AuthenticatedRedirect />} />
          <Route path="/auth" element={user ? <AuthenticatedRedirect /> : <Auth />} />
          
          {/* Protected routes */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <UpdatedOnboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home"
            element={
              <OnboardingGuard>
                <Home />
              </OnboardingGuard>
            }
          />
          <Route
            path="/challenge"
            element={
              <ProtectedRoute>
                <Challenge />
              </ProtectedRoute>
            }
          />
          <Route
            path="/challenges"
            element={
              <ProtectedRoute>
                <Challenges />
              </ProtectedRoute>
            }
          />
          <Route
            path="/achievements"
            element={
              <ProtectedRoute>
                <Achievements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/your-work"
            element={
              <ProtectedRoute>
                <YourWork />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
