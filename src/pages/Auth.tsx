import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Mail, Lock, User, AtSign, Chrome } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import GlassCard from '@/components/GlassCard';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { toast } from '@/hooks/use-toast';

// Validation schemas
const signInSchema = z.object({
  email: z.string().email('Invalid email address').max(255, 'Email too long'),
  password: z.string().min(1, 'Password is required'),
});

const signUpSchema = z.object({
  username: z.string().min(1, 'Username is required').max(30),
  fullName: z.string().min(1, 'Full name is required').max(100),
  email: z.string().email('Invalid email address').max(255),
  password: z.string().min(1, 'Password is required').max(128),
});

export default function Auth() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const [isLogin, setIsLogin] = useState(mode !== 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  // Update isLogin when URL mode changes
  useEffect(() => {
    setIsLogin(mode !== 'signup');
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const validated = signInSchema.parse({ email, password });
        const { error } = await signIn(validated.email, validated.password);
        if (!error) {
          const { data: session } = await supabase.auth.getSession();
          if (session?.session?.user) {
            const { data: userHobbies } = await supabase
              .from('user_hobbies')
              .select('id')
              .eq('user_id', session.session.user.id)
              .limit(1);
            
            if (userHobbies && userHobbies.length > 0) {
              navigate('/home');
            } else {
              navigate('/onboarding');
            }
          }
        }
      } else {
        const validated = signUpSchema.parse({ username, fullName, email, password });
        
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', validated.username.toLowerCase())
          .maybeSingle();
        
        if (existingUser) {
          toast({
            title: 'Username Taken',
            description: 'This username is already in use. Please choose another.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
        
        const { error } = await signUp(validated.email, validated.password, validated.fullName, validated.username);
        if (!error) {
          navigate('/onboarding');
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: error.errors[0].message,
          variant: 'destructive',
        });
      }
      // Silently ignore network/fetch errors for signup - don't show scary errors
    }

    setLoading(false);
  };

const handleGoogleSignIn = async () => {
  setGoogleLoading(true);
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      toast({
        title: 'Google Sign In Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  } catch (error: any) {
    toast({
      title: 'Google Sign In Failed',
      description: error.message || 'An unexpected error occurred',
      variant: 'destructive',
    });
  }
  setGoogleLoading(false);
};

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle minimal background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        {/* Faint grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Soft vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background))_85%)]" />
        {/* Quiet drifting sparkles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-[3px] h-[3px] rounded-full bg-foreground/30"
            style={{
              left: `${(i * 41 + 7) % 100}%`,
              top: `${(i * 59 + 11) % 100}%`,
            }}
            animate={{ opacity: [0.1, 0.5, 0.1] }}
            transition={{
              duration: 5 + (i % 3),
              repeat: Infinity,
              delay: i * 0.4,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md relative"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center gap-2 glass-strong px-5 py-2 rounded-full mb-5 border border-primary/30 shadow-lg shadow-primary/10"
          >
            <Sparkles className="w-5 h-5 text-primary animate-pulse-glow" />
            <span className="text-sm font-semibold tracking-wide">Welcome to MicroMuse</span>
          </motion.div>
          <motion.h1
            key={isLogin ? 'login' : 'signup'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-display font-bold mb-3 leading-tight"
          >
            <span className="gradient-text">
              {isLogin ? 'Welcome Back' : 'Begin Your Story'}
            </span>
          </motion.h1>
          <p className="text-muted-foreground text-base">
            {isLogin
              ? 'Sign in to continue your creative journey ✨'
              : 'Where 10 minutes a day sparks a lifetime of art 🎨'}
          </p>
        </div>

        <GlassCard className="p-6 space-y-6 border border-white/20 shadow-2xl shadow-primary/10 backdrop-blur-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {/* Username field - first */}
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="Choose a unique username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        className="pl-10 glass"
                        required={!isLogin}
                        maxLength={30}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Letters, numbers, and underscores only</p>
                  </div>
                  
                  {/* Full Name field - second */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10 glass"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 glass"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 glass"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground"
              disabled={loading || googleLoading}
            >
              {loading ? (
                'Please wait...'
              ) : isLogin ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
          >
            {googleLoading ? (
              'Connecting to Google...'
            ) : (
              <>
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </>
            )}
          </Button>

          <div className="text-center text-sm">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </GlassCard>

        <p className="text-center text-sm text-muted-foreground mt-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}
