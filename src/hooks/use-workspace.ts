"use client"; // Ensure this runs only on the client side

import { Role } from "@/config/permissions";
import { CURRENT_WORKSPACE } from "@/lib/workspace-utils";
import { useSession } from "next-auth/react";
import { useMemo, useState, useEffect } from "react";

export const useWorkspace = () => {
  const [currentWorkspace, setCurrentWorkspace] = useState<string | null>(null);
  const { data, status } = useSession();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedWorkspace = localStorage.getItem(CURRENT_WORKSPACE);

    if (!storedWorkspace && data?.user && status === "authenticated") {
      const defaultWorkspace = data.user.workspaces?.[0]?.keyWorkspace ?? "";
      localStorage.setItem(CURRENT_WORKSPACE, defaultWorkspace);
      setCurrentWorkspace(defaultWorkspace);
    } else {
      setCurrentWorkspace(storedWorkspace);
    }
  }, [data?.user, status]);

  const activeWorkspace = useMemo(() => {
    if (data?.user.workspaces && currentWorkspace) {
      const workspace =
        data.user.workspaces?.find(
          (wp) => wp.keyWorkspace === currentWorkspace,
        ) ?? null;
      if (workspace) {
        return {
          ...workspace,
          role: workspace?.role as Role,
        };
      }
    }
    return null;
  }, [data?.user.workspaces, currentWorkspace]);

  return { activeWorkspace };
};
