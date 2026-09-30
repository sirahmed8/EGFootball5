'use client';

import React from 'react';
import { Skeleton, SkeletonCircle } from '@/components/ui/skeleton';

export function HomePageSkeleton() {
  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-10 mt-12 animate-in fade-in duration-300">
      <div className="text-center space-y-4 max-w-3xl mx-auto py-6">
        <Skeleton className="h-12 md:h-14 w-3/4 mx-auto rounded-3xl" />
        <Skeleton className="h-6 w-1/2 mx-auto rounded-2xl" />
      </div>

      <div className="flex items-center gap-3 justify-center overflow-x-auto pb-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-10 w-28 rounded-full shrink-0" />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-3xl border border-white/10 bg-black p-5 space-y-4 shadow-xl"
          >
            <Skeleton className="h-56 w-full rounded-2xl" />
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-1/2 rounded-xl" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-3/4 rounded-lg" />
              <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                <Skeleton className="h-6 w-24 rounded-lg" />
                <Skeleton className="h-11 w-32 rounded-2xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MatchesPageSkeleton() {
  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8 mt-12 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-3">
          <Skeleton className="h-10 w-64 rounded-2xl" />
          <Skeleton className="h-5 w-80 rounded-xl" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-40 rounded-full" />
          <Skeleton className="h-11 w-44 rounded-full" />
        </div>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-28 rounded-full shrink-0" />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-3xl border border-white/10 bg-black p-6 space-y-5 shadow-xl"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-6 w-40 rounded-xl" />
                <Skeleton className="h-4 w-24 rounded-lg" />
              </div>
              <Skeleton className="h-7 w-20 rounded-full" />
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-28 rounded" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-4 w-12 rounded" />
              </div>
              <Skeleton className="h-2.5 w-full rounded-full" />
            </div>

            <div className="pt-2">
              <Skeleton className="h-11 w-full rounded-2xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BookPageSkeleton() {
  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8 mt-12 animate-in fade-in duration-300">
      <div className="space-y-3">
        <Skeleton className="h-10 w-64 rounded-2xl" />
        <Skeleton className="h-5 w-96 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <div className="rounded-3xl border border-white/10 bg-black p-6 space-y-6 shadow-xl">
            <Skeleton className="h-7 w-40 rounded-xl" />
            <Skeleton className="h-72 w-full rounded-2xl" />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-black p-6 space-y-6 shadow-xl">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-24 rounded-full shrink-0" />
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2.5 flex flex-col items-center"
                >
                  <Skeleton className="h-5 w-20 rounded-lg" />
                  <Skeleton className="h-4 w-14 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfilePageSkeleton() {
  return (
    <div className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8 space-y-8 mt-12 animate-in fade-in duration-300">
      <div className="rounded-3xl border border-white/10 bg-black p-6 md:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <SkeletonCircle className="h-24 w-24" />
          <div className="space-y-3 text-center sm:text-start flex-1">
            <Skeleton className="h-8 w-48 rounded-xl mx-auto sm:mx-0" />
            <Skeleton className="h-5 w-36 rounded-lg mx-auto sm:mx-0" />
            <div className="flex gap-2 justify-center sm:justify-start pt-1">
              <Skeleton className="h-7 w-28 rounded-full" />
              <Skeleton className="h-7 w-32 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 border-b border-white/10 pb-4">
        <Skeleton className="h-10 w-36 rounded-full" />
        <Skeleton className="h-10 w-36 rounded-full" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-3xl border border-white/10 bg-black p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl"
          >
            <div className="space-y-2.5 flex-1">
              <Skeleton className="h-6 w-48 rounded-lg" />
              <div className="flex flex-wrap gap-4 pt-1">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-4 w-32 rounded" />
              </div>
            </div>
            <Skeleton className="h-11 w-32 rounded-2xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CheckoutPageSkeleton() {
  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 space-y-8 mt-12 animate-in fade-in duration-300">
      <Skeleton className="h-16 w-full rounded-2xl" />

      <div className="rounded-3xl border border-white/10 bg-black p-6 md:p-8 space-y-6 shadow-xl">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-6 w-36 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SubscriptionPageSkeleton() {
  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 space-y-8 mt-12 animate-in fade-in duration-300">
      <div className="text-center space-y-4 max-w-3xl mx-auto py-6">
        <Skeleton className="h-12 w-3/4 mx-auto rounded-3xl" />
        <Skeleton className="h-6 w-1/2 mx-auto rounded-xl" />
      </div>

      <div className="rounded-3xl border border-amber-500/30 bg-black p-8 space-y-6 shadow-2xl max-w-2xl mx-auto">
        <Skeleton className="h-8 w-48 mx-auto rounded-xl" />
        <Skeleton className="h-14 w-36 mx-auto rounded-2xl" />
        <div className="space-y-3 pt-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-6 w-full rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-14 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export function AuthPageSkeleton() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black p-6 md:p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-3">
          <Skeleton className="h-12 w-12 mx-auto rounded-2xl" />
          <Skeleton className="h-8 w-48 mx-auto rounded-xl" />
          <Skeleton className="h-4 w-64 mx-auto rounded-lg" />
        </div>
        <div className="space-y-4 pt-2">
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export function LegalPageSkeleton() {
  return (
    <div className="min-h-screen bg-black py-12 px-4 max-w-4xl mx-auto space-y-8">
      <div className="space-y-3 border-b border-white/10 pb-6">
        <Skeleton className="h-10 w-64 rounded-2xl" />
        <Skeleton className="h-4 w-48 rounded-lg" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-6 w-40 rounded-xl" />
            <Skeleton className="h-4 w-full rounded-lg" />
            <Skeleton className="h-4 w-5/6 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

