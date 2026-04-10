import { Button } from '@/components/ui/button';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  Sparkles, Music, Palette, PenTool, Target, Trophy,
  Clock, ChevronDown, Brain, BookOpen, Code, Dumbbell, Check,
  Zap, Users, Shield, ArrowRight, Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRef, useMemo } from 'react';
import LandingFooter from '@/components/LandingFooter';
import TypewriterText from '@/components/TypewriterText';

const features = [
  { icon: Brain, title: 'Studies & Learning', description: 'Master math, science, languages with focused micro-challenges', gradient: 'from-blue-500/20 to-cyan-500/20', accent: 'text-blue-400' },
  { icon: Music, title: 'Musical Mastery', description: 'Focused practice sessions with AI feedback', gradient: 'from-violet-500/20 to-purple-500/20', accent: 'text-violet-400' },
  { icon: Palette, title: 'Artistic Expression', description: 'Daily creative prompts to unlock your inner artist', gradient: 'from-pink-500/20 to-rose-500/20', accent: 'text-pink-400' },
  { icon: Code, title: 'Coding Excellence', description: 'Build real projects through bite-sized challenges', gradient: 'from-emerald-500/20 to-teal-500/20', accent: 'text-emerald-400' },
  { icon: PenTool, title: 'Writing Brilliance', description: 'Micro-challenges to sharpen your storytelling', gradient: 'from-amber-500/20 to-orange-500/20', accent: 'text-amber-400' },
  { icon: Dumbbell, title: 'Fitness Goals', description: 'Short workouts and wellness challenges', gradient: 'from-red-500/20 to-orange-500/20', accent: 'text-red-400' },
];

const howItWorks = [
  { step: 1, title: 'Choose Your Hobbies', description: 'Select from 50+ activities including Studies, Music, Art, Coding, and more', icon: Target },
  { step: 2, title: 'Get Personalized Challenges', description: 'Receive daily challenges tailored exactly to your selected interests', icon: Sparkles },
  { step: 3, title: 'Complete in 10-15 Minutes', description: 'Short, focused sessions that fit into any schedule', icon: Clock },
  { step: 4, title: 'Track Your Progress', description: 'Build streaks, earn achievements, and watch yourself improve', icon: Trophy },
];

const highlights = [
  { icon: Zap, title: 'Micro Challenges', desc: 'Bite-sized daily tasks that fit any schedule', gradient: 'from-amber-500 to-orange-500' },
  { icon: Shield, title: 'E2E Encrypted', desc: 'Your data stays private with zero-knowledge security', gradient: 'from-emerald-500 to-teal-500' },
  { icon: Brain, title: 'AI-Powered', desc: 'Smart personalization that adapts to your growth', gradient: 'from-violet-500 to-purple-500' },
  { icon: Trophy, title: 'Streak System', desc: 'Build consistency with gamified progress tracking', gradient: 'from-pink-500 to-rose-500' },
];

function AnimatedSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.7], [1, 0.95]);

  const hobbies = useMemo(() => [
    { name: 'Studies', emoji: '📚' }, { name: 'Music', emoji: '🎵' },
    { name: 'Art', emoji: '🎨' }, { name: 'Coding', emoji: '💻' },
    { name: 'Writing', emoji: '✍️' }, { name: 'Fitness', emoji: '💪' },
    { name: 'Dance', emoji: '💃' }, { name: 'Photography', emoji: '📷' },
  ], []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      {/* Ambient Background Glow */}
      <div className="fixed inset-0 pointer-events-none -z-5">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-secondary/3 blur-[150px]" />
      </div>

      {/* Nav */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/60 border-b border-border/30"
      >
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <motion.div className="flex items-center gap-2.5" whileHover={{ scale: 1.03 }}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-display font-bold gradient-text">MicroMuse</span>
          </motion.div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-foreground/70 hover:text-foreground" onClick={() => navigate('/auth?mode=login')}>
              Log In
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 shadow-lg shadow-primary/20" onClick={() => navigate('/auth?mode=signup')}>
              Get Started
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-20 px-4">
        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="text-center max-w-5xl mx-auto relative z-10">
          {/* Pill */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-sm font-medium text-primary">Your daily creative companion</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold leading-[1.05] tracking-tight mb-8"
          >
            <span className="text-foreground">Show Up Daily,</span>
            <br />
            <TypewriterText text="Grow Forever" delay={900} speed={100} className="text-primary" />
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Small consistent steps build lasting habits. Nurture your passions with personalized daily challenges—one moment at a time.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-10 py-7 rounded-2xl shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:scale-[1.03] group"
              onClick={() => navigate('/auth?mode=signup')}
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-10 py-7 rounded-2xl border-border/50 hover:bg-muted/30 backdrop-blur-sm"
              onClick={() => navigate('/auth?mode=login')}
            >
              I have an account
            </Button>
          </motion.div>

          {/* Hobby Pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {hobbies.map((h, i) => (
              <motion.span
                key={h.name}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1 + i * 0.08, type: 'spring', stiffness: 300, damping: 15 }}
                whileHover={{ scale: 1.1, y: -3 }}
                className="px-4 py-2 rounded-full bg-muted/60 backdrop-blur-sm border border-border/40 text-sm font-medium text-foreground/80 cursor-default select-none"
              >
                {h.emoji} {h.name}
              </motion.span>
            ))}
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-20"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="flex flex-col items-center gap-2 text-muted-foreground/60 cursor-pointer"
              onClick={() => document.getElementById('stats')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <span className="text-xs tracking-widest uppercase">Scroll</span>
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════ HIGHLIGHTS BAR ═══════════════════ */}
      <section id="stats" className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" />
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {highlights.map((item, i) => (
              <AnimatedSection key={item.title} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -4, scale: 1.03 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="relative group rounded-2xl p-5 border border-border/40 bg-card/40 backdrop-blur-sm hover:border-primary/30 transition-colors overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-[0.07] transition-opacity duration-500`} />
                  <div className="relative z-10 flex flex-col items-center text-center gap-3">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg`}>
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-base font-display font-semibold text-foreground">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FEATURES ═══════════════════ */}
      <section className="py-28 px-4">
        <div className="container mx-auto max-w-7xl">
          <AnimatedSection className="text-center mb-16">
            <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">Explore Categories</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Challenges That <span className="gradient-text">Match Your Passions</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              You choose the hobbies. We create personalized challenges.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, index) => (
              <AnimatedSection key={feature.title} delay={index * 0.08}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="group relative rounded-2xl p-6 border border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-colors overflow-hidden h-full"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <feature.icon className={`w-6 h-6 ${feature.accent}`} />
                    </div>
                    <h3 className="text-lg font-display font-semibold mb-2 text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <section className="py-28 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.03] to-transparent" />
        <div className="container mx-auto max-w-6xl relative">
          <AnimatedSection className="text-center mb-20">
            <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">Simple Process</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              How <span className="gradient-text">MicroMuse</span> Works
            </h2>
            <p className="text-lg text-muted-foreground">Four simple steps to transform your skills</p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-14 left-[12%] right-[12%] h-px bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

            {howItWorks.map((item, index) => (
              <AnimatedSection key={item.step} delay={index * 0.12}>
                <div className="text-center relative">
                  <motion.div
                    whileHover={{ scale: 1.08, rotate: 3 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 relative"
                  >
                    <item.icon className="w-8 h-8 text-primary" />
                    <div className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-lg shadow-primary/30">
                      {item.step}
                    </div>
                  </motion.div>
                  <h3 className="text-lg font-display font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ BENEFITS ═══════════════════ */}
      <section className="py-28 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection>
              <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">Why MicroMuse</p>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 leading-tight">
                Only Challenges You'll <span className="gradient-text">Actually Love</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                We don't show music challenges to coders or study tasks to dancers.
                Your personalized feed contains only what you've chosen to master.
              </p>
              <div className="space-y-5">
                {[
                  'Challenges based ONLY on your selected hobbies',
                  'AI-powered personalization that learns your style',
                  'Progress tracking with streaks and achievements',
                  'Built-in AI assistant to help you learn faster',
                ].map((benefit, i) => (
                  <AnimatedSection key={i} delay={i * 0.1}>
                    <div className="flex items-center gap-4">
                      <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="text-foreground/90">{benefit}</span>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="relative rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-6 space-y-3 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
                <div className="relative z-10 space-y-3">
                  {[
                    { icon: Brain, title: 'Math Puzzle Sprint', meta: '10 min • Beginner • 15 pts', active: true },
                    { icon: Code, title: 'Build a Mini Calculator', meta: '15 min • Moderate • 25 pts', active: false },
                    { icon: BookOpen, title: 'Speed Reading Challenge', meta: '10 min • Beginner • 10 pts', active: false },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ x: 4 }}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${item.active ? 'bg-primary/10 border-primary/25' : 'bg-muted/30 border-border/30 hover:border-primary/20'}`}
                    >
                      <item.icon className="w-7 h-7 text-primary flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-sm text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.meta}</p>
                      </div>
                    </motion.div>
                  ))}
                  <p className="text-center text-xs text-muted-foreground pt-3">
                    ✨ Shown because you selected Studies & Coding
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FINAL CTA ═══════════════════ */}
      <section className="py-32 px-4">
        <AnimatedSection className="container mx-auto max-w-3xl text-center">
          <div className="relative rounded-3xl border border-border/30 bg-card/40 backdrop-blur-sm p-12 md:p-16 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-foreground">
                Ready to Build<br />Lasting Habits?
              </h2>
              <p className="text-muted-foreground mb-10 max-w-lg mx-auto leading-relaxed">
                Small consistent efforts compound into remarkable growth. Start your personalized journey today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-10 py-7 rounded-2xl shadow-xl shadow-primary/25 hover:scale-[1.03] transition-all group"
                  onClick={() => navigate('/auth?mode=signup')}
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-10 py-7 rounded-2xl border-border/50 hover:bg-muted/30"
                  onClick={() => navigate('/auth?mode=login')}
                >
                  Log In
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-6">No credit card required • Free forever</p>
            </div>
          </div>
        </AnimatedSection>
      </section>

      <LandingFooter />
    </div>
  );
}
