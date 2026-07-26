'use client';

import dynamic from 'next/dynamic';

const FloatingChatWidget = dynamic(
  () => import('@/components/FloatingChatWidget').then((m) => m.FloatingChatWidget),
  { ssr: false }
);

export function ClientChatWidget() {
  return <FloatingChatWidget />;
}
