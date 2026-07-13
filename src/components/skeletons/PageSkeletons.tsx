'use client';

import React from 'react';
import { Skeleton, SkeletonCircle } from '@/components/ui/skeleton';

export function HomePageSkeleton() {
  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-12 mt-12 animate-in fade-in duration-500">
      {/* Hero Header Skeleton */}
      <div className="text-center space-y-4 max-w-3xl mx-auto py-8">
        <Skeleton className="h-12 md:h-14 w-3/4 mx-auto rounded-2xl" />
        <Skeleton className="h-6 w-1/2 mx-auto rounded-xl" />
      </div>

      {/* Pitches Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-5 space-y-4 shadow-lg"
          >
            <Skeleton className="h-56 w-full rounded-xl" />
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-1/2 rounded-lg" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-3/4 rounded-md" />
              <div className="pt-3 border-t border-border/30 flex justify-between items-center">
                <Skeleton className="h-6 w-24 rounded-md" />
                <Skeleton className="h-10 w-28 rounded-full" />
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
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8 mt-12 animate-in fade-in duration-500">
      {/* Page Title & Action Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/40 pb-6">
        <div className="space-y-3">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-5 w-80 rounded-lg" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-40 rounded-full" />
          <Skeleton className="h-11 w-44 rounded-full" />
        </div>
      </div>

      {/* Filter Tabs Skeleton */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-28 rounded-full shrink-0" />
        ))}
      </div>

      {/* Matches Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-6 space-y-5 shadow-lg"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-6 w-40 rounded-lg" />
                <Skeleton className="h-4 w-24 rounded-md" />
              </div>
              <Skeleton className="h-7 w-20 rounded-full" />
            </div>

            {/* Date & Time block */}
            <div className="p-3.5 rounded-xl bg-background/50 border border-border/30 space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-28 rounded" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>
            </div>

            {/* Players Progress Skeleton */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-4 w-12 rounded" />
              </div>
              <Skeleton className="h-2.5 w-full rounded-full" />
            </div>

            {/* Button Bar */}
            <div className="pt-2">
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BookPageSkeleton() {
  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8 mt-12 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-5 w-96 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Calendar Card */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-6 space-y-6 shadow-lg">
            <Skeleton className="h-7 w-40 rounded-lg" />
            <Skeleton className="h-72 w-full rounded-xl" />
          </div>
        </div>

        {/* Right Column: Time Blocks Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-6 space-y-6 shadow-lg">
            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-24 rounded-full shrink-0" />
              ))}
            </div>

            {/* Slot Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border/40 bg-background/40 p-4 space-y-2.5 flex flex-col items-center"
                >
                  <Skeleton className="h-5 w-20 rounded-md" />
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
    <div className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8 space-y-8 mt-12 animate-in fade-in duration-500">
      {/* Profile Header Card */}
      <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-6 md:p-8 shadow-lg">
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

      {/* Tabs Bar */}
      <div className="flex gap-3 border-b border-border/40 pb-4">
        <Skeleton className="h-10 w-36 rounded-full" />
        <Skeleton className="h-10 w-36 rounded-full" />
      </div>

      {/* Bookings List Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md"
          >
            <div className="space-y-2.5 flex-1">
              <Skeleton className="h-6 w-48 rounded-lg" />
              <div className="flex flex-wrap gap-4 pt-1">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-4 w-24 rounded" />
              </div>
            </div>
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CheckoutPageSkeleton() {
  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 space-y-8 mt-12 animate-in fade-in duration-500">
      {/* Alert Banner Skeleton */}
      <Skeleton className="h-16 w-full rounded-2xl" />

      {/* Receipt Card Skeleton */}
      <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-6 md:p-8 space-y-6 shadow-lg">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-background/40 border border-border/30 space-y-2">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-6 w-36 rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* Payment Instructions Skeleton */}
      <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-6 md:p-8 space-y-6 shadow-lg">
        <Skeleton className="h-7 w-56 rounded-lg" />
        <Skeleton className="h-44 w-full rounded-xl" />
        <div className="pt-4 flex justify-end">
          <Skeleton className="h-12 w-48 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function DashboardPageSkeleton() {
  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8 mt-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="space-y-3">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-5 w-80 rounded-lg" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-6 space-y-3 shadow-md"
          >
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24 rounded" />
              <SkeletonCircle className="h-8 w-8" />
            </div>
            <Skeleton className="h-8 w-32 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-6 space-y-4 shadow-lg">
        <Skeleton className="h-7 w-48 rounded-lg" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-background/30 border border-border/30 flex justify-between items-center"
            >
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-36 rounded" />
                <Skeleton className="h-4 w-24 rounded" />
              </div>
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function UsersPageSkeleton() {
  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8 mt-12 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-52 rounded-xl" />
          <Skeleton className="h-4 w-72 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-64 rounded-xl" />
      </div>

      <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-border/40 flex gap-4">
          <Skeleton className="h-6 w-1/4 rounded" />
          <Skeleton className="h-6 w-1/4 rounded" />
          <Skeleton className="h-6 w-1/4 rounded" />
          <Skeleton className="h-6 w-1/4 rounded" />
        </div>
        <div className="divide-y divide-border/30">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <SkeletonCircle className="h-10 w-10" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-3 w-40 rounded" />
                </div>
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20 rounded-lg" />
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
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
