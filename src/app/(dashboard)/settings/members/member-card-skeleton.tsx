import { Skeleton } from "@/components/ui/skeleton";

export function MemberCardSkeleton() {
	return (
		<div className="flex items-center justify-between rounded-lg border p-3">
			<div className="flex items-center gap-3">
				<Skeleton className="h-10 w-10 rounded-full" />
				<div className="grid gap-0.5">
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-3 w-24" />
				</div>
			</div>
			<div className="flex items-center gap-3">
				<Skeleton className="hidden h-5 w-16 sm:inline-flex" />
				<Skeleton className="h-8 w-24" />
				<Skeleton className="h-8 w-8" />
			</div>
		</div>
	);
}
