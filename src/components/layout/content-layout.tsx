import React from "react";
import { Separator } from "@/components/ui/separator";

interface ContentLayoutProps {
  title?: string;
  children?: React.ReactNode;
}
function ContentLayout({ children, title }: ContentLayoutProps) {
  return (
    <div className="flex flex-1 flex-col px-10 py-6 pb-16">
      {title ? (
        <React.Fragment>
          <h2>{title}</h2>
          <Separator className="my-6" />
        </React.Fragment>
      ) : null}
      <div className="flex flex-col space-y-8">{children}</div>
    </div>
  );
}

export default ContentLayout;
