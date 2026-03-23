import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, FileText, Mail, X, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PrivacyContent, TermsContent } from '@/components/PolicyModalContent';

export default function LeaderboardFooter() {
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'contact' | null>(null);

  return (
    <>
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 py-8 border-t border-white/10"
      >
        <div className="flex flex-wrap items-center justify-center gap-6">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveModal('privacy')}
            className="flex items-center gap-2 px-4 py-2 rounded-full glass hover:bg-white/10 transition-all duration-300 text-muted-foreground hover:text-foreground"
          >
            <Shield className="w-4 h-4" />
            <span>Privacy</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveModal('terms')}
            className="flex items-center gap-2 px-4 py-2 rounded-full glass hover:bg-white/10 transition-all duration-300 text-muted-foreground hover:text-foreground"
          >
            <FileText className="w-4 h-4" />
            <span>Terms</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveModal('contact')}
            className="flex items-center gap-2 px-4 py-2 rounded-full glass hover:bg-white/10 transition-all duration-300 text-muted-foreground hover:text-foreground"
          >
            <Mail className="w-4 h-4" />
            <span>Contact</span>
          </motion.button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          © {new Date().getFullYear()} MicroMuse. All rights reserved.
        </p>
      </motion.footer>

      {/* Privacy Modal */}
      <Dialog open={activeModal === 'privacy'} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="glass-strong border-white/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Shield className="w-6 h-6 text-primary" />
              Privacy Policy
            </DialogTitle>
          </DialogHeader>
          <PrivacyContent />
        </DialogContent>
      </Dialog>

      {/* Terms Modal */}
      <Dialog open={activeModal === 'terms'} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="glass-strong border-white/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <FileText className="w-6 h-6 text-primary" />
              Terms of Service
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-muted-foreground max-h-[60vh] overflow-y-auto pr-2">
            <section>
              <h3 className="text-foreground font-semibold mb-2">Acceptance of Terms</h3>
              <p>By using MicroMuse, you agree to these terms. If you disagree with any part, please do not use our services.</p>
            </section>
            <section>
              <h3 className="text-foreground font-semibold mb-2">User Conduct</h3>
              <p>Users must maintain respectful behavior, not engage in cheating or manipulation of rankings, and not share inappropriate content. Violations may result in account suspension.</p>
            </section>
            <section>
              <h3 className="text-foreground font-semibold mb-2">Intellectual Property</h3>
              <p>Content you create remains yours. By sharing, you grant us a license to display it within the platform. Our platform design, code, and branding are protected.</p>
            </section>
            <section>
              <h3 className="text-foreground font-semibold mb-2">Points & Rankings</h3>
              <p>Points are earned through legitimate participation. We reserve the right to adjust or remove points gained through abuse or exploitation of the system.</p>
            </section>
            <section>
              <h3 className="text-foreground font-semibold mb-2">Modifications</h3>
              <p>We may update these terms periodically. Continued use after changes constitutes acceptance of the new terms.</p>
            </section>
            <section>
              <h3 className="text-foreground font-semibold mb-2">Limitation of Liability</h3>
              <p>MicroMuse is provided "as is" without warranties. We are not liable for any damages arising from platform use.</p>
            </section>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Modal */}
      <Dialog open={activeModal === 'contact'} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="glass-strong border-white/20 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Mail className="w-6 h-6 text-primary" />
              Contact Us
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass p-4 rounded-xl"
            >
              <p className="text-sm text-muted-foreground mb-1">Owner</p>
              <p className="text-lg font-semibold text-foreground">Roshan Gowda J</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass p-4 rounded-xl"
            >
              <p className="text-sm text-muted-foreground mb-1">Contact</p>
              <a 
                href="mailto:roshangowda737@gmail.com" 
                className="text-lg font-semibold text-primary hover:underline"
              >
                roshangowda737@gmail.com
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass p-4 rounded-xl"
            >
              <p className="text-sm text-muted-foreground mb-1">LinkedIn</p>
              <a 
                href="https://www.linkedin.com/in/roshan-gowda" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-lg font-semibold text-primary hover:underline group"
              >
                Connect
                <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </a>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
