"use client";

import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useWorkspace } from "@/hooks/use-workspace";
import {
  NavigationMainConstant,
  NavigationSecondaryConstant,
} from "@/lib/navigation-menu";
import { useSession } from "next-auth/react";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data } = useSession();
  useWorkspace();
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
