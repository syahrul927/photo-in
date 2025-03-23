"use client"; // Ensure this runs only on the client side

import { CURRENT_WORKSPACE } from "@/lib/workspace-utils";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

const LocalStorageInitializer = () => {
  const { data, status } = useSession();
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (
      !localStorage.getItem(CURRENT_WORKSPACE) &&
      data?.user &&
      status === "authenticated"
    ) {
      localStorage.setItem(
        CURRENT_WORKSPACE,
        data.user.workspaces?.[0]?.keyWorkspace ?? "",
      );
    }
  }, [data?.user, status]);

  return null; // This component doesn't render anything
};

export default LocalStorageInitializer;
