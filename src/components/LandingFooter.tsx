import { useState } from 'react';
import { Shield, FileText, Mail, Heart } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PrivacyContent, TermsContent } from './PolicyModalContent';
import ContactModalContent from './ContactModalContent';

export default function LandingFooter() {
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'contact' | null>(null);

  return (
    <>
      <footer className="py-12 px-4 border-t border-border/50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center gap-8">
            {/* Stress Support Link */}
            <a 
              href="https://sense-u.vercel.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-3 px-8 py-4 rounded-2xl glass border-2 border-primary/30 hover:border-primary transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 bg-gradient-to-r from-primary/5 to-primary/10"
            >
              <Heart className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-lg font-semibold text-foreground">
                Not able to manage stress?{' '}
                <span className="text-primary underline underline-offset-4 group-hover:text-primary/80 transition-colors font-bold">
                  Click here
                </span>
              </span>
            </a>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setActiveModal('privacy')}
                className="group flex items-center gap-2.5 pl-2.5 pr-5 py-2 rounded-full bg-card border border-border shadow-sm hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Shield className="w-3.5 h-3.5" />
                </span>
                <span className="text-sm font-medium text-foreground">Privacy</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModal('terms')}
                className="group flex items-center gap-2.5 pl-2.5 pr-5 py-2 rounded-full bg-card border border-border shadow-sm hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <FileText className="w-3.5 h-3.5" />
                </span>
                <span className="text-sm font-medium text-foreground">Terms</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModal('contact')}
                className="group flex items-center gap-2.5 pl-2.5 pr-5 py-2 rounded-full bg-card border border-border shadow-sm hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Mail className="w-3.5 h-3.5" />
                </span>
                <span className="text-sm font-medium text-foreground">Contact</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Privacy Modal */}
      <Dialog open={activeModal === 'privacy'} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="modal-dark max-w-2xl">
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
        <DialogContent className="modal-dark max-w-2xl">
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
        <DialogContent className="modal-dark max-w-md">
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