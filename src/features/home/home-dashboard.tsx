"use client";

import { WelcomeHeader } from "./components/welcome-header";
import { StatsOverview } from "./components/stats-overview";
import { RecentEvents } from "./components/recent-events";
import { RecentPhotos } from "./components/recent-photos";
import { UpcomingEvents } from "./components/upcoming-events";

export function HomeDashboard() {
  return (
    <div className="flex flex-col gap-6 py-2">
      <WelcomeHeader />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsOverview />
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentEvents />
        </div>
        <div>
          <UpcomingEvents />
        </div>
      </div>
      
      <RecentPhotos />
    </div>
  );
}