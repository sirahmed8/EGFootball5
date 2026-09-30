'use client';

import React from 'react';
import { Skeleton, SkeletonCircle } from '@/components/ui/skeleton';

export function ChallengesPageSkeleton() {
  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8 mt-12 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64 rounded-2xl" />
          <Skeleton className="h-5 w-80 rounded-xl" />
        </div>
        <Skeleton className="h-12 w-48 rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-3xl border border-white/10 bg-black p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SkeletonCircle className="h-12 w-12" />
                <Skeleton className="h-6 w-40 rounded-xl" />
              </div>
              <Skeleton className="h-7 w-20 rounded-full" />
            </div>
            <Skeleton className="h-14 w-full rounded-2xl" />
            <Skeleton className="h-11 w-full rounded-2xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TournamentsPageSkeleton() {
  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8 mt-12 animate-in fade-in duration-300">
      <div className="text-center space-y-4 max-w-3xl mx-auto py-6">
        <Skeleton className="h-12 w-3/4 mx-auto rounded-3xl" />
        <Skeleton className="h-6 w-1/2 mx-auto rounded-xl" />
      </div>

      <div className="rounded-3xl border border-white/10 bg-black p-8 space-y-6 shadow-xl">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-6 w-32 rounded-lg mx-auto" />
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LeaderboardPageSkeleton() {
  return (
    <div className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8 space-y-8 mt-12 animate-in fade-in duration-300">
      <div className="text-center space-y-4 max-w-3xl mx-auto py-6">
        <Skeleton className="h-12 w-3/4 mx-auto rounded-3xl" />
        <Skeleton className="h-6 w-1/2 mx-auto rounded-xl" />
      </div>

      <div className="flex justify-center items-end gap-4 py-8">
        <Skeleton className="h-44 w-28 rounded-t-3xl" />
        <Skeleton className="h-60 w-32 rounded-t-3xl" />
        <Skeleton className="h-36 w-28 rounded-t-3xl" />
      </div>

      <div className="rounded-3xl border border-white/10 bg-black p-6 space-y-4 shadow-xl">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-4">
              <SkeletonCircle className="h-10 w-10" />
              <Skeleton className="h-5 w-36 rounded-lg" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AchievementsPageSkeleton() {
  return (
    <div className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8 space-y-8 mt-12 animate-in fade-in duration-300">
      <div className="text-center space-y-4 max-w-3xl mx-auto py-6">
        <Skeleton className="h-12 w-3/4 mx-auto rounded-3xl" />
        <Skeleton className="h-6 w-1/2 mx-auto rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-3xl border border-white/10 bg-black p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <SkeletonCircle className="h-12 w-12" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-6 w-36 rounded-xl" />
            <Skeleton className="h-4 w-full rounded-lg" />
            <Skeleton className="h-3 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function VarHighlightsPageSkeleton() {
  return (
    <div className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8 space-y-8 mt-12 animate-in fade-in duration-300">
      <div className="space-y-3">
        <Skeleton className="h-10 w-64 rounded-2xl" />
        <Skeleton className="h-5 w-80 rounded-xl" />
      </div>

      <div className="rounded-3xl border border-white/10 bg-black p-6 space-y-6 shadow-xl">
        <Skeleton className="h-80 md:h-[420px] w-full rounded-2xl" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-7 w-60 rounded-xl" />
          <Skeleton className="h-11 w-36 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export function LiveStreamPageSkeleton() {
  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-6 mt-12 animate-in fade-in duration-300">
      <div className="flex justify-between items-center border-b border-white/10 pb-6">
        <Skeleton className="h-10 w-64 rounded-2xl" />
        <Skeleton className="h-8 w-32 rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Skeleton className="h-80 md:h-[450px] w-full rounded-3xl" />
        </div>
        <div className="lg:col-span-1 rounded-3xl border border-white/10 bg-black p-6 space-y-4 shadow-xl">
          <Skeleton className="h-7 w-36 rounded-xl" />
          <div className="space-y-3 h-72">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function JerseyDesignerPageSkeleton() {
  return (
    <div className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8 space-y-8 mt-12 animate-in fade-in duration-300">
      <div className="space-y-3">
        <Skeleton className="h-10 w-64 rounded-2xl" />
        <Skeleton className="h-5 w-80 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Skeleton className="h-96 w-full rounded-3xl" />
        <div className="rounded-3xl border border-white/10 bg-black p-6 space-y-6 shadow-xl">
          <Skeleton className="h-8 w-40 rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export function CeremonyPageSkeleton() {
  return (
    <div className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8 space-y-8 mt-12 animate-in fade-in duration-300">
      <div className="text-center space-y-4 max-w-3xl mx-auto py-6">
        <Skeleton className="h-12 w-3/4 mx-auto rounded-3xl" />
        <Skeleton className="h-6 w-1/2 mx-auto rounded-xl" />
      </div>

      <div className="flex justify-center gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 w-28 rounded-3xl" />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    </div>
  );
}

export function GoalOfTheMonthPageSkeleton() {
  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8 mt-12 animate-in fade-in duration-300">
      <div className="text-center space-y-4 max-w-2xl mx-auto mb-10">
        <Skeleton className="h-10 md:h-12 w-3/4 mx-auto rounded-2xl" />
        <Skeleton className="h-4 w-1/2 mx-auto rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-3xl border border-white/10 bg-black p-6 space-y-5 shadow-xl"
          >
            <Skeleton className="h-48 w-full rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-3/4 rounded-xl" />
              <Skeleton className="h-4 w-full rounded-lg" />
            </div>
            <div className="pt-2 flex gap-2">
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
