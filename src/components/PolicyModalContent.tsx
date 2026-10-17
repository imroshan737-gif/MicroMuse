import { motion } from 'framer-motion';
import {
  Shield, FileText, Lock, Eye, Database, UserCheck, Cookie,
  Scale, Users, Lightbulb, Trophy, AlertTriangle, RefreshCw,
} from 'lucide-react';

interface Section {
  icon: React.ReactNode;
  title: string;
  content: string;
}

function PolicySection({ icon, title, content, index }: Section & { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="group relative rounded-xl border border-border bg-card p-5 transition-smooth hover:border-primary/25"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1.5">
            <span className="text-[11px] font-mono text-muted-foreground/70">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="text-foreground font-display font-semibold text-base tracking-tight">
              {title}
            </h3>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">{content}</p>
        </div>
      </div>
    </motion.div>
  );
}

function PolicyHeader({
  icon,
  eyebrow,
  title,
  subtitle,
}: { icon: React.ReactNode; eyebrow: string; title: string; subtitle: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-5"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl glass-strong border border-primary/20 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div>
          <p className="eyebrow mb-1">{eyebrow}</p>
          <p className="text-foreground font-display font-semibold text-lg tracking-tight">{title}</p>
          <p className="text-muted-foreground text-sm">{subtitle}</p>
        </div>
      </div>
      <div className="hairline mt-5" />
    </motion.div>
  );
}

const privacySections: Section[] = [
  {
    icon: <Database className="w-4 h-4" strokeWidth={1.75} />,
    title: 'Data Collection',
    content: 'We collect minimal personal information necessary to provide our services, including your username, email address, and activity data within the platform.',
  },
  {
    icon: <Eye className="w-4 h-4" strokeWidth={1.75} />,
    title: 'Data Usage',
    content: 'Your data is used to personalize your experience, track your progress, display leaderboard rankings, and improve our services. We never sell your personal information to third parties.',
  },
  {
    icon: <Lock className="w-4 h-4" strokeWidth={1.75} />,
    title: 'Data Security',
    content: 'We implement industry-standard security measures including encryption, secure authentication, and regular security audits to protect your information.',
  },
  {
    icon: <UserCheck className="w-4 h-4" strokeWidth={1.75} />,
    title: 'Your Rights',
    content: 'You have the right to access, modify, or delete your personal data at any time. Contact us for any privacy-related requests.',
  },
  {
    icon: <Cookie className="w-4 h-4" strokeWidth={1.75} />,
    title: 'Cookies',
    content: 'We use essential cookies for authentication and session management. No tracking cookies are used without your consent.',
  },
];

const termsSections: Section[] = [
  {
    icon: <Scale className="w-4 h-4" strokeWidth={1.75} />,
    title: 'Acceptance of Terms',
    content: 'By using MicroMuse, you agree to these terms. If you disagree with any part, please do not use our services.',
  },
  {
    icon: <Users className="w-4 h-4" strokeWidth={1.75} />,
    title: 'User Conduct',
    content: 'Users must maintain respectful behavior, not engage in cheating or manipulation of rankings, and not share inappropriate content. Violations may result in account suspension.',
  },
  {
    icon: <Lightbulb className="w-4 h-4" strokeWidth={1.75} />,
    title: 'Intellectual Property',
    content: 'Content you create remains yours. By sharing, you grant us a license to display it within the platform. Our platform design, code, and branding are protected.',
  },
  {
    icon: <Trophy className="w-4 h-4" strokeWidth={1.75} />,
    title: 'Points & Rankings',
    content: 'Points are earned through legitimate participation. We reserve the right to adjust or remove points gained through abuse or exploitation of the system.',
  },
  {
    icon: <RefreshCw className="w-4 h-4" strokeWidth={1.75} />,
    title: 'Modifications',
    content: 'We may update these terms periodically. Continued use after changes constitutes acceptance of the new terms.',
  },
  {
    icon: <AlertTriangle className="w-4 h-4" strokeWidth={1.75} />,
    title: 'Limitation of Liability',
    content: 'MicroMuse is provided "as is" without warranties. We are not liable for any damages arising from platform use.',
  },
];

export function PrivacyContent() {
  return (
    <div className="space-y-2.5 max-h-[65vh] overflow-y-auto pr-1 custom-scrollbar">
      <PolicyHeader
        icon={<Shield className="w-5 h-5" strokeWidth={1.75} />}
        eyebrow="Privacy"
        title="Your privacy matters"
        subtitle="We collect the least we can, and protect what we hold."
      />

      {privacySections.map((section, i) => (
        <PolicySection key={section.title} index={i} {...section} />
      ))}

      <p className="pt-4 text-center text-xs text-muted-foreground">
        Last updated {new Date().getFullYear()} · MicroMuse
      </p>
    </div>
  );
}

export function TermsContent() {
  return (
    <div className="space-y-2.5 max-h-[65vh] overflow-y-auto pr-1 custom-scrollbar">
      <PolicyHeader
        icon={<FileText className="w-5 h-5" strokeWidth={1.75} />}
        eyebrow="Terms"
        title="Terms of Service"
        subtitle="Simple guidelines that keep MicroMuse fair for everyone."
      />

      {termsSections.map((section, i) => (
        <PolicySection key={section.title} index={i} {...section} />
      ))}

      <p className="pt-4 text-center text-xs text-muted-foreground">
        Last updated {new Date().getFullYear()} · MicroMuse
      </p>
    </div>
  );
}
