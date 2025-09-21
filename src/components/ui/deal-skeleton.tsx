import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DealSkeletonProps {
  layout?: 'grid' | 'coupon';
  className?: string;
}

export function DealSkeleton({ layout = 'grid', className }: DealSkeletonProps) {
  if (layout === 'coupon') {
    return (
      <div className={cn("border rounded-xl p-6 space-y-4 bg-card", className)}>
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-4 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("border rounded-xl overflow-hidden bg-card", className)}>
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <div className="flex justify-between items-center text-sm pt-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

export function DealSkeletonGrid({ count = 6, layout = 'grid' }: { count?: number; layout?: 'grid' | 'coupon' }) {
  return (
    <div className={`grid gap-6 ${
      layout === 'grid' 
        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
        : 'grid-cols-1 lg:grid-cols-2'
    }`}>
      {Array.from({ length: count }, (_, i) => (
        <DealSkeleton key={i} layout={layout} />
      ))}
    </div>
  );
}