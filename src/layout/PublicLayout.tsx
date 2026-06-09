import type { ReactNode } from 'react';
import { MarketingNav, Footer } from '@/screens/Landing';

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <MarketingNav />
      {/* 64px (h-16) navigation header spacer */}
      <div className="h-16 shrink-0" />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
