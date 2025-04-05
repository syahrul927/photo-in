import React from "react";
import { Separator } from "../ui/separator";

interface ContentLayoutProps {
  title?: string;
  children?: React.ReactNode;
  rightHeaderComponent?: React.ReactNode;
  description?: string;
}
function ContentLayout({
  children,
  title,
  description,
  rightHeaderComponent: rightContent,
}: ContentLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex flex-col space-y-1">
            <h2>{title}</h2>
            <p className="text-muted-foreground">{description}</p>
          </div>
          {rightContent}
        </div>
        <Separator />
        {children}
      </div>
    </div>
  );
}

export default ContentLayout;
