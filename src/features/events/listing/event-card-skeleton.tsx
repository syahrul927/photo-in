import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface EventCardSkeletonProps {
  index?: number;
}

export const EventCardSkeleton = ({ index = 0 }: EventCardSkeletonProps) => {
  return (
    <div
      style={{
        opacity: 1,
        transform: "none",
        animationDelay: `${0.1 * index}s`,
      }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center">
              <Skeleton className="mr-2 h-4 w-4" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center">
              <Skeleton className="mr-2 h-4 w-4" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-20 rounded-full" />
              <div className="flex gap-1">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
