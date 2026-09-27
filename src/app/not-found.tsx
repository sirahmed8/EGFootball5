import Link from 'next/link';
import { Compass, Home, ShieldAlert } from 'lucide-react';

export default function GlobalNotFound() {
  return (
    <html lang="en" className="dark" style={{ backgroundColor: '#0b0f17' }}>
      <body className="bg-background text-foreground antialiased min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card/85 border border-border/60 rounded-2xl p-8 text-center backdrop-blur-md shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 text-primary">
            <ShieldAlert className="w-8 h-8" aria-hidden="true" />
          </div>

          <span className="inline-block text-xs font-mono font-semibold tracking-wider text-muted-foreground uppercase bg-muted/60 px-3 py-1 rounded-md mb-3 border border-border/40">
            HTTP 404
          </span>

          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-3">
            Page Out of Bounds / الصفحة غير موجودة
          </h1>

          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            The requested address does not exist. Choose your preferred language to return to EGFootball5.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/ar"
              className="flex-1 min-h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm px-5 py-2.5 shadow-sm hover:opacity-95 active:scale-[0.98] transition-all"
            >
              <Home className="w-4 h-4" aria-hidden="true" />
              <span>الرئيسية (عربي)</span>
            </Link>

            <Link
              href="/en"
              className="flex-1 min-h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-muted/60 border border-border/60 hover:bg-muted text-foreground font-medium text-sm px-5 py-2.5 active:scale-[0.98] transition-all"
            >
              <Compass className="w-4 h-4" aria-hidden="true" />
              <span>Home (English)</span>
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
