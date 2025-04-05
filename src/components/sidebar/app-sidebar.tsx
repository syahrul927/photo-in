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
  const { data, status } = useSession();
  useWorkspace();
  const isLoading = status === "loading";
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <TeamSwitcher
          isLoading={isLoading}
          workspaces={data?.user.workspaces ?? []}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={NavigationMainConstant} isLoading={isLoading} />
        <NavSecondary
          items={NavigationSecondaryConstant}
          className="mt-auto"
          isLoading={isLoading}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data?.user} isLoading={isLoading} />
      </SidebarFooter>
    </Sidebar>
  );
}
