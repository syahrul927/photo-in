"use client";

import {
  AudioWaveformIcon,
  Command,
  GalleryVerticalEndIcon,
} from "lucide-react";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  NavigationMainConstant,
  NavigationSecondaryConstant,
} from "@/lib/navigation-menu";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";
import { useSession } from "next-auth/react";

const teams = [
  {
    name: "Tim Jakarta",
    logo: GalleryVerticalEndIcon,
    plan: "Enterprise",
  },
  {
    name: "Tim Bandung",
    logo: AudioWaveformIcon,
    plan: "Startup",
  },
  {
    name: "Tim Bekasi",
    logo: Command,
    plan: "Free",
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data } = useSession();
  if (!data) return null;
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <TeamSwitcher workspaces={data.user.workspaces ?? []} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={NavigationMainConstant} />
        <NavSecondary items={NavigationSecondaryConstant} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
