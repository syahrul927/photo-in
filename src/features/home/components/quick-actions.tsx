"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, CalendarPlus, Share2 } from "lucide-react";
import Link from "next/link";

const quickActions = [
  {
    title: "Create Event",
    description: "Start a new photography session",
    icon: CalendarPlus,
    href: "/events/create",
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    title: "Upload Photos",
    description: "Add photos to existing events",
    icon: Upload,
    href: "/events",
    color: "bg-green-500 hover:bg-green-600",
  },
  {
    title: "View Gallery",
    description: "Browse your photo collections",
    icon: Share2,
    href: "/events",
    color: "bg-purple-500 hover:bg-purple-600",
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link key={`${action.href}_${index}`} href={action.href}>
              <Button variant="outline" className="w-full justify-start">
                <Icon className="mr-2 h-4 w-4" />
                <div className="text-left">
                  <div className="text-sm font-medium">{action.title}</div>
                  <div className="text-muted-foreground text-xs">
                    {action.description}
                  </div>
                </div>
              </Button>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
