import { motion } from 'framer-motion';
import { Shield, FileText, Lock, Eye, Database, UserCheck, Cookie, Sparkles, Scale, Users, Lightbulb, Trophy, AlertTriangle, RefreshCw } from 'lucide-react';

const sectionVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' }
  })
};

interface PolicySectionProps {
  icon: React.ReactNode;
  title: string;
  content: string;
  index: number;
  accent: string;
}

function PolicySection({ icon, title, content, index, accent }: PolicySectionProps) {
  return (
    <motion.div
      custom={index}
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      className="group relative"
    >
      <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${accent} p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5`}>
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/25 transition-all duration-300">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-foreground font-bold text-base mb-1.5 group-hover:text-primary transition-colors duration-300">
              {title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {content}
            </p>
          </div>
        </div>

        {/* Bottom shine line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </motion.div>
  );
}

const privacySections = [
  {
    icon: <Database className="w-5 h-5" />,
    title: 'Data Collection',
    content: 'We collect minimal personal information necessary to provide our services, including your username, email address, and activity data within the platform.',
    accent: 'from-blue-500/5 to-transparent',
  },
  {
    icon: <Eye className="w-5 h-5" />,
    title: 'Data Usage',
    content: 'Your data is used to personalize your experience, track your progress, display leaderboard rankings, and improve our services. We never sell your personal information to third parties.',
    accent: 'from-purple-500/5 to-transparent',
  },
  {
    icon: <Lock className="w-5 h-5" />,
    title: 'Data Security',
    content: 'We implement industry-standard security measures including encryption, secure authentication, and regular security audits to protect your information.',
    accent: 'from-emerald-500/5 to-transparent',
  },
  {
    icon: <UserCheck className="w-5 h-5" />,
    title: 'Your Rights',
    content: 'You have the right to access, modify, or delete your personal data at any time. Contact us for any privacy-related requests.',
    accent: 'from-amber-500/5 to-transparent',
  },
  {
    icon: <Cookie className="w-5 h-5" />,
    title: 'Cookies',
    content: 'We use essential cookies for authentication and session management. No tracking cookies are used without your consent.',
    accent: 'from-rose-500/5 to-transparent',
  },
];

const termsSections = [
  {
    icon: <Scale className="w-5 h-5" />,
    title: 'Acceptance of Terms',
    content: 'By using MicroMuse, you agree to these terms. If you disagree with any part, please do not use our services.',
    accent: 'from-indigo-500/5 to-transparent',
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: 'User Conduct',
    content: 'Users must maintain respectful behavior, not engage in cheating or manipulation of rankings, and not share inappropriate content. Violations may result in account suspension.',
    accent: 'from-cyan-500/5 to-transparent',
  },
  {
    icon: <Lightbulb className="w-5 h-5" />,
    title: 'Intellectual Property',
    content: 'Content you create remains yours. By sharing, you grant us a license to display it within the platform. Our platform design, code, and branding are protected.',
    accent: 'from-yellow-500/5 to-transparent',
  },
  {
    icon: <Trophy className="w-5 h-5" />,
    title: 'Points & Rankings',
    content: 'Points are earned through legitimate participation. We reserve the right to adjust or remove points gained through abuse or exploitation of the system.',
    accent: 'from-orange-500/5 to-transparent',
  },
  {
    icon: <RefreshCw className="w-5 h-5" />,
    title: 'Modifications',
    content: 'We may update these terms periodically. Continued use after changes constitutes acceptance of the new terms.',
    accent: 'from-teal-500/5 to-transparent',
  },
  {
    icon: <AlertTriangle className="w-5 h-5" />,
    title: 'Limitation of Liability',
    content: 'MicroMuse is provided "as is" without warranties. We are not liable for any damages arising from platform use.',
    accent: 'from-red-500/5 to-transparent',
  },
];

export function PrivacyContent() {
  return (
    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
      {/* Hero banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 p-5 mb-4 border border-primary/20"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.15),transparent_70%)]" />
        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-foreground font-bold text-lg">Your Privacy Matters</p>
            <p className="text-muted-foreground text-sm">We're committed to protecting your data</p>
          </div>
        </div>
        <Sparkles className="absolute top-3 right-3 w-5 h-5 text-primary/40 animate-pulse" />
      </motion.div>

      {privacySections.map((section, i) => (
        <PolicySection key={section.title} index={i} {...section} />
      ))}
    </div>
  );
}

export function TermsContent() {
  return (
    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
      {/* Hero banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 p-5 mb-4 border border-primary/20"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,hsl(var(--primary)/0.15),transparent_70%)]" />
        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-foreground font-bold text-lg">Terms of Service</p>
            <p className="text-muted-foreground text-sm">Guidelines for a great experience</p>
          </div>
        </div>
        <Sparkles className="absolute top-3 right-3 w-5 h-5 text-primary/40 animate-pulse" />
      </motion.div>

      {termsSections.map((section, i) => (
        <PolicySection key={section.title} index={i} {...section} />
      ))}
    </div>
  );
}
