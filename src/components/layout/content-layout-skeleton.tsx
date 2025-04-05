import { ReactNode } from "react";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";

export function ContentLayoutSkeleton({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex flex-col space-y-1">
            <Skeleton className="h-10 w-[300px]" />
            <Skeleton className="h-5 w-[400px]" />
          </div>
          <Skeleton className="h-10 w-[100px]" />
        </div>
        <Separator />
        {children}
      </div>
    </div>
  );
}
