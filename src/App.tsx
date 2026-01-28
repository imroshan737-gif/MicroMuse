import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import ThreeScene from "@/components/ThreeScene";
import Header from "@/components/Header";
import AIChatbot from "@/components/AIChatbot";

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
          <Route path="/" element={user ? <Navigate to="/home" replace /> : <Landing />} />
          <Route path="/auth" element={<Auth />} />
          
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
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
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
