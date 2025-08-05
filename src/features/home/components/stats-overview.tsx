"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Camera, FolderOpen, Image, Clock } from "lucide-react";

export function StatsOverview() {
  const statsQuery = api.event.getOverviewStats.useQuery();

  const stats = statsQuery.data;
  const statsCards = [
    {
      title: "Total Events",
      value: stats?.totalEvents || 0,
      icon: FolderOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Photos",
      value: stats?.totalPhotos || 0,
      icon: Image,
      color: "text-green-600", 
      bgColor: "bg-green-100",
    },
    {
      title: "In Progress",
      value: stats?.inProgressEvents || 0,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      title: "Upcoming",
      value: stats?.upcomingEvents || 0,
      icon: Camera,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  if (statsQuery.isLoading) {
    return (
      <>
        {statsCards.map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <Skeleton className="h-4 w-24" />
              </CardTitle>
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </>
    );
  }

  return (
    <>
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-full ${stat.bgColor} p-2`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </>
  );
}