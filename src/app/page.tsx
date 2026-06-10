'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    const preferred = localStorage.getItem('preferredLocale') || 'ar';
    router.push(`/${preferred}`);
  }, [router]);
  return null;
}
