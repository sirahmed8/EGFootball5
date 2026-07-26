'use client';

import * as React from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export function MainContainer({ children }: { children: React.ReactNode }) {
  const firebaseUser = useAuthStore((s) => s.firebaseUser);

  return (
    <main className={`min-h-screen flex flex-col pt-16 md:pt-16 transition-all duration-300 ${firebaseUser ? 'md:ms-64' : 'md:ms-0'}`}>
      {children}
    </main>
  );
}
