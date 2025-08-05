"use client";

import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Sunrise } from "lucide-react";

function getTimeBasedGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function WelcomeHeader() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const user = session?.user;

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>
    );
  }

  const greeting = getTimeBasedGreeting();

  return (
    <div className="rounded-lg border bg-blue-50 p-6 dark:bg-blue-950/30">
      <div className="flex items-start gap-4">
        <div className="rounded-full bg-blue-500 p-3 text-white">
          <Sunrise className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting}, {user?.name?.split(" ")[0] || "Photographer"}!
          </h1>
          <p className="text-sm text-muted-foreground">
            Ready to capture and organize today&apos;s moments?
          </p>
        </div>
      </div>
    </div>
  );
}