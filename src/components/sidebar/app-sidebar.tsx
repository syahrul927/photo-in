"use client";

import {
  AudioWaveformIcon,
  Command,
  GalleryVerticalEndIcon,
  LifeBuoy,
  Send,
  Settings2Icon,
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
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
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
