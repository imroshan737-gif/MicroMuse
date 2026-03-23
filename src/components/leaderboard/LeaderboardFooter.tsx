import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, FileText, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PrivacyContent, TermsContent } from '@/components/PolicyModalContent';
import ContactModalContent from '@/components/ContactModalContent';

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
          <TermsContent />
        </DialogContent>
      </Dialog>

      {/* Contact Modal */}
      <Dialog open={activeModal === 'contact'} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="glass-strong border-white/20 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Mail className="w-6 h-6 text-primary" />
              Contact
            </DialogTitle>
          </DialogHeader>
          <ContactModalContent />
        </DialogContent>
      </Dialog>
    </>
  );
}
