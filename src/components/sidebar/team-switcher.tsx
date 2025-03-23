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
import { Workspace } from "@/types/next-auth";
import { DynamicIcon, IconName } from "lucide-react/dynamic";

export function TeamSwitcher({ workspaces }: { workspaces: Workspace[] }) {
  const { isMobile } = useSidebar();
  const currentWorkspace = localStorage.getItem(CURRENT_WORKSPACE);
  const [activeWorkspace, setActiveWorkspace] =
    React.useState<Workspace | null>(null);

  const switchWorkspace = (workspace: Workspace) => {
    if (workspace.workspaceId === activeWorkspace?.workspaceId) return;
    setActiveWorkspace(workspace);
    localStorage.setItem(CURRENT_WORKSPACE, workspace.keyWorkspace);
    window.location.reload();
  };

  React.useEffect(() => {
    if (currentWorkspace) {
      const selectedWorkspace = workspaces.find(
        (item) => item.keyWorkspace === currentWorkspace,
      );
      setActiveWorkspace(selectedWorkspace ?? null);
    }
  }, [currentWorkspace]);

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
              <div className="flex aspect-square size-6 items-center justify-center rounded-sm bg-sidebar-primary text-sidebar-primary-foreground">
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
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Workspace
            </DropdownMenuLabel>
            {workspaces.map((team, index) => (
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
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                Add Workspace
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
