'use client';

import React from 'react';
import { Skeleton, SkeletonCircle } from '@/components/ui/skeleton';

export function GuidePageSkeleton() {
  return (
    <div className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8 space-y-8 mt-12 animate-in fade-in duration-300">
      <div className="space-y-3">
        <Skeleton className="h-10 w-64 rounded-2xl" />
        <Skeleton className="h-5 w-80 rounded-xl" />
      </div>

      <div className="space-y-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-3xl border border-white/10 bg-black p-6 space-y-3 shadow-xl">
            <Skeleton className="h-7 w-60 rounded-xl" />
            <Skeleton className="h-4 w-full rounded-lg" />
            <Skeleton className="h-4 w-4/5 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardPageSkeleton() {
  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8 mt-12 animate-in fade-in duration-300">
      <div className="space-y-3">
        <Skeleton className="h-10 w-64 rounded-2xl" />
        <Skeleton className="h-5 w-80 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-3xl border border-white/10 bg-black p-6 space-y-3 shadow-xl">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24 rounded" />
              <SkeletonCircle className="h-8 w-8" />
            </div>
            <Skeleton className="h-8 w-32 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function UsersPageSkeleton() {
  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8 mt-12 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-52 rounded-2xl" />
          <Skeleton className="h-4 w-72 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-64 rounded-2xl" />
      </div>

      <div className="rounded-3xl border border-white/10 bg-black overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/10 flex gap-4">
          <Skeleton className="h-6 w-1/4 rounded" />
          <Skeleton className="h-6 w-1/4 rounded" />
          <Skeleton className="h-6 w-1/4 rounded" />
        </div>
        <div className="divide-y divide-white/10">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <SkeletonCircle className="h-10 w-10" />
                <Skeleton className="h-4 w-32 rounded" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
