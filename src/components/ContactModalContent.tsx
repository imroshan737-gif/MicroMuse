import ownerPhoto from '@/assets/owner.jpg.asset.json';
import { motion } from 'framer-motion';
import { User, Mail, Linkedin, MapPin, ExternalLink } from 'lucide-react';

const links = [
  {
    icon: Mail,
    label: 'Email',
    value: 'roshangowda737@gmail.com',
    href: 'mailto:roshangowda737@gmail.com',
    external: false,
  },
  {
    icon: Linkedin,
    label: 'LinkedIn',
    value: 'Connect with me',
    href: 'https://www.linkedin.com/in/roshan-gowda',
    external: true,
  },
];

export default function ContactModalContent() {
  return (
    <div className="space-y-6 py-2">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="text-center"
      >
        <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-primary/40 shadow-md mb-4">
          <img src={ownerPhoto.url} alt="Roshan Gowda J" className="w-full h-full object-cover" />
        </div>
        <p className="eyebrow mb-2">Get in touch</p>
        <h3 className="text-2xl font-display font-semibold tracking-tight">Roshan Gowda J</h3>
        <p className="text-sm text-muted-foreground mt-1">Creator &amp; Developer</p>
      </motion.div>

      <div className="hairline" />

      {/* Contact rows */}
      <div className="grid gap-2">
        {links.map((link, i) => (
          <motion.a
            key={link.label}
            href={link.href}
            target={link.external ? '_blank' : undefined}
            rel={link.external ? 'noopener noreferrer' : undefined}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.06, duration: 0.35 }}
            className="group flex items-center gap-4 p-4 rounded-xl border border-border/60 bg-card/40 hover:border-primary/30 transition-smooth"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <link.icon className="w-4.5 h-4.5 text-primary" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="eyebrow">{link.label}</p>
              <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                {link.value}
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </motion.a>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
          className="flex items-center gap-4 p-4 rounded-xl border border-border/60 bg-card/40"
        >
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4.5 h-4.5 text-muted-foreground" strokeWidth={1.75} />
          </div>
          <div>
            <p className="eyebrow">Location</p>
            <p className="text-sm font-medium text-foreground">India</p>
          </div>
        </motion.div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Usually replies within a day.
      </p>
    </div>
  );
}
