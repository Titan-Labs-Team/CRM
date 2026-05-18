import { cn } from '@/lib/utils';

interface Props {
  className?: string;
}

export function Skeleton({ className }: Props) {
  return (
    <div className={cn('animate-pulse rounded bg-bg-border', className)} />
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3">
          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function KanbanSkeleton({ columns = 3 }: { columns?: number }) {
  return (
    <div className="flex gap-4">
      {Array.from({ length: columns }).map((_, col) => (
        <div key={col} className="flex-shrink-0 w-72 space-y-3">
          <Skeleton className="h-8 w-full" />
          {Array.from({ length: 3 }).map((_, card) => (
            <div key={card} className="bg-bg-surface border border-bg-border rounded-lg p-3 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <div className="flex items-center justify-between pt-1">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-bg-surface border border-bg-border rounded-lg p-4 space-y-3">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-3 w-48" />
    </div>
  );
}
