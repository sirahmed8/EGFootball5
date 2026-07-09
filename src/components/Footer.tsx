import { Link } from '@/i18n/routing';

export function Footer() {
  return (
    <footer className="w-full py-8 mt-auto border-t border-border/50 bg-background/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center gap-4 text-sm text-muted-foreground">
        <a 
          href="https://linktr.ee/sir.ahmed" 
          target="_blank" 
          rel="noopener noreferrer"
          className="font-bold text-primary hover:text-primary/80 transition-colors"
        >
          Connect with Developer
        </a>
        
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <span className="opacity-50">•</span>
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          <span className="opacity-50">•</span>
          <Link href="/cookies" className="hover:text-foreground transition-colors">Cookie Policy</Link>
        </div>
        
        <div className="text-xs mt-2">
          © 2026 EGFootball5. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
