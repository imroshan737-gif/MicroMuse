import { motion } from 'framer-motion';
import { User, Mail, Linkedin, Sparkles, MapPin, Rocket, ExternalLink } from 'lucide-react';

export default function ContactModalContent() {
  return (
    <div className="space-y-6 py-2">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-2xl overflow-hidden p-6 text-center bg-gradient-to-br from-purple-600/20 via-pink-500/20 to-orange-400/20 border border-primary/20"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.15),transparent_50%)]" />
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-3 right-3"
        >
          <Sparkles className="w-5 h-5 text-primary/40" />
        </motion.div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-[3px] mb-4"
        >
          <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
        </motion.div>
        <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
          Roshan Gowda J
        </h3>
        <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
          <Rocket className="w-3.5 h-3.5" />
          Creator & Developer
        </p>
      </motion.div>

      {/* Contact Cards */}
      <div className="grid gap-3">
        <motion.a
          href="mailto:roshangowda737@gmail.com"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02, x: 4 }}
          className="group flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-all cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Email</p>
            <p className="text-sm font-semibold text-foreground truncate group-hover:text-blue-400 transition-colors">
              roshangowda737@gmail.com
            </p>
          </div>
          <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </motion.a>

        <motion.a
          href="https://www.linkedin.com/in/roshan-gowda"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02, x: 4 }}
          className="group flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 flex-shrink-0">
            <Linkedin className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">LinkedIn</p>
            <p className="text-sm font-semibold text-foreground group-hover:text-purple-400 transition-colors">
              Connect with me
            </p>
          </div>
          <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </motion.a>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Location</p>
            <p className="text-sm font-semibold text-foreground">India 🇮🇳</p>
          </div>
        </motion.div>
      </div>

      {/* Footer sparkle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center text-xs text-muted-foreground pt-2"
      >
        ✨ Built with passion & late-night coffee ☕
      </motion.p>
    </div>
  );
}
