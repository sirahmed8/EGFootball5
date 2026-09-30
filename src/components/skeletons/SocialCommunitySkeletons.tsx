'use client';

import React from 'react';
import { Skeleton, SkeletonCircle } from '@/components/ui/skeleton';

export function CommunitiesPageSkeleton() {
  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8 mt-12 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64 rounded-2xl" />
          <Skeleton className="h-5 w-80 rounded-xl" />
        </div>
        <Skeleton className="h-12 w-48 rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-3xl border border-white/10 bg-black p-6 space-y-5 shadow-xl">
            <div className="flex items-center gap-4">
              <SkeletonCircle className="h-14 w-14" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-36 rounded-xl" />
                <Skeleton className="h-4 w-24 rounded-lg" />
              </div>
            </div>
            <Skeleton className="h-12 w-full rounded-xl" />
            <div className="pt-3 border-t border-white/10 flex justify-between">
              <Skeleton className="h-5 w-20 rounded-md" />
              <Skeleton className="h-5 w-28 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NotificationsPageSkeleton() {
  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 space-y-8 mt-12 animate-in fade-in duration-300">
      <div className="flex justify-between items-center border-b border-white/10 pb-6">
        <Skeleton className="h-10 w-64 rounded-2xl" />
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-3xl border border-white/10 bg-black p-6 flex gap-4 items-start shadow-xl">
            <SkeletonCircle className="h-10 w-10 shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-48 rounded-xl" />
              <Skeleton className="h-4 w-3/4 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CommunityChatPageSkeleton() {
  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-6 mt-12 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[650px]">
        <div className="lg:col-span-1 rounded-3xl border border-white/10 bg-black p-4 space-y-3 shadow-xl">
          <Skeleton className="h-7 w-32 rounded-xl mb-4" />
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-2xl" />
          ))}
        </div>

        <div className="lg:col-span-3 rounded-3xl border border-white/10 bg-black p-6 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3">
                <SkeletonCircle className="h-9 w-9" />
                <Skeleton className="h-12 w-2/3 rounded-2xl" />
              </div>
            ))}
          </div>
          <Skeleton className="h-12 w-full rounded-2xl mt-4" />
        </div>
      </div>
    </div>
  );
}

export function AnnouncementsPageSkeleton() {
  return (
    <div className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8 space-y-8 mt-12 animate-in fade-in duration-300">
      <div className="space-y-3">
        <Skeleton className="h-10 w-64 rounded-2xl" />
        <Skeleton className="h-5 w-80 rounded-xl" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-3xl border border-white/10 bg-black p-6 space-y-3 shadow-xl">
            <Skeleton className="h-6 w-48 rounded-xl" />
            <Skeleton className="h-4 w-full rounded-lg" />
            <Skeleton className="h-4 w-2/3 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SupportPageSkeleton() {
  return (
    <div className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8 space-y-8 mt-12 animate-in fade-in duration-300">
      <div className="flex justify-between items-center border-b border-white/10 pb-6">
        <Skeleton className="h-10 w-64 rounded-2xl" />
        <Skeleton className="h-12 w-48 rounded-full" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function ChatMessagesSkeleton() {
  return (
    <div className="p-4 space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`flex flex-col ${i % 2 === 0 ? 'items-end' : 'items-start'} space-y-1.5`}
        >
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton
            className={`h-10 ${i % 2 === 0 ? 'w-48' : 'w-60'} rounded-2xl`}
          />
        </div>
      ))}
    </div>
  );
}
