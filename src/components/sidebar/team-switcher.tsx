"use client";

import { ChevronsUpDown, Plus } from "lucide-react";
import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { CURRENT_WORKSPACE } from "@/lib/workspace-utils";
import { type Workspace } from "@/types/next-auth";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { PAGE_URLS } from "@/lib/page-url";
import { Skeleton } from "../ui/skeleton";

export function TeamSwitcher({
  workspaces,
  isLoading,
}: {
  workspaces: Workspace[];
  isLoading?: boolean;
}) {
  const { isMobile } = useSidebar();
  const [activeWorkspace, setActiveWorkspace] =
    React.useState<Workspace | null>(null);

  const switchWorkspace = (workspace: Workspace) => {
    if (workspace.workspaceId === activeWorkspace?.workspaceId) return;
    setActiveWorkspace(workspace);
    localStorage.setItem(CURRENT_WORKSPACE, workspace.keyWorkspace);
    window.location.assign(PAGE_URLS.HOME);
  };

  React.useEffect(() => {
    if (localStorage) {
      const currentWorkspace = localStorage.getItem(CURRENT_WORKSPACE);
      const selectedWorkspace = workspaces.find(
        (item) => item.keyWorkspace === currentWorkspace,
      );
      setActiveWorkspace(selectedWorkspace ?? null);
    }
  }, [workspaces]);

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center gap-3 p-2">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <ChevronsUpDown className="ml-auto h-4 w-4 opacity-50" />
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }
  if (!activeWorkspace) {
    return null;
  }
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-6 items-center justify-center rounded-sm">
                <DynamicIcon
                  name={activeWorkspace.icon as IconName}
                  className="size-4"
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeWorkspace.name}
                </span>
                <span className="truncate text-xs">
                  {activeWorkspace.description}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Workspace
            </DropdownMenuLabel>
            {workspaces.map((team) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => switchWorkspace(team)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <DynamicIcon
                    name={team.icon as IconName}
                    className="size-4 shrink-0"
                  />
                </div>
                {team.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="bg-background flex size-6 items-center justify-center rounded-md border">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">
                Add Workspace
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
