import ContentLayout from "@/components/layout/content-layout";
import { ContentSidebar } from "@/components/sidebar/content-sidebar";
import { NavigationType } from "@/components/sidebar/types";
import { Separator } from "@/components/ui/separator";
import { NavigationSettingsConstant } from "@/lib/navigation-menu";
import React from "react";

function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <ContentLayout title="Settings">
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-8 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <ContentSidebar items={NavigationSettingsConstant} />
        </aside>
        <div className="flex-1 lg:max-w-2xl">{children}</div>
      </div>
    </ContentLayout>
  );
}

export default SettingsLayout;
