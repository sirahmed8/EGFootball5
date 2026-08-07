import { cn } from "@/lib/utils"
import React from "react"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-muted/60 dark:bg-muted/30 animate-skeleton-pulse before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-primary/15 before:to-transparent",
        className
      )}
      {...props}
    />
  )
}

function SkeletonCircle({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Skeleton
      className={cn("rounded-full shrink-0", className)}
      {...props}
    />
  )
}

function SkeletonText({
  className,
  lines = 1,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { lines?: number }) {
  if (lines <= 1) {
    return <Skeleton className={cn("h-4 w-3/4 rounded-md", className)} {...props} />;
  }
  return (
    <div className="space-y-2.5 w-full">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4 rounded-md",
            i === lines - 1 ? "w-1/2" : "w-full",
            className
          )}
          {...props}
        />
      ))}
    </div>
  );
}

function SkeletonCard({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-6 space-y-4",
        className
      )}
      {...props}
    >
      {children || (
        <>
          <Skeleton className="h-48 w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="pt-2 flex justify-between items-center">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-28 rounded-full" />
          </div>
        </>
      )}
    </div>
  );
}

export { Skeleton, SkeletonCircle, SkeletonText, SkeletonCard }
