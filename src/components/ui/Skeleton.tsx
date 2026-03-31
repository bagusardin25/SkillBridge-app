import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/60 dark:bg-muted/30",
        className
      )}
      {...props}
    />
  );
}

/** Full-page loading skeleton for the main app canvas */
export function AppSkeleton() {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar skeleton */}
      <div className="w-64 border-r p-4 space-y-4 hidden md:block">
        <Skeleton className="h-8 w-32" />
        <div className="space-y-2 mt-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-[60vh] w-full rounded-xl" />
      </div>
    </div>
  );
}

/** Profile page loading skeleton */
export function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>

      {/* Content */}
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

/** Chat panel loading skeleton */
export function ChatSkeleton() {
  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="flex-1 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
            <Skeleton className={`h-16 ${i % 2 === 0 ? "w-2/3" : "w-3/4"} rounded-xl`} />
          </div>
        ))}
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}

export { Skeleton };
