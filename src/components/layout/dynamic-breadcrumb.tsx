"use client";

import { Home } from "lucide-react";
import { usePathname } from "next/navigation";
import React from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getBreadcrumbs } from "@/lib/breadcrumb-utils";
import {
  NavigationMainConstant,
  NavigationSecondaryConstant,
} from "@/lib/navigation-menu";
import Link from "next/link";

interface BreadcrumbNavProps {
  className?: string;
}

export function DynamicBreadCrumb({ className }: BreadcrumbNavProps) {
  const pathname = usePathname();
  const breadcrumb = getBreadcrumbs(
    [...NavigationMainConstant, ...NavigationSecondaryConstant],
    pathname!,
  );

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <Link href="/" className="flex items-center">
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
        </BreadcrumbItem>

        {breadcrumb?.map((item, index) => {
          if (index === breadcrumb.length - 1)
            return (
              <React.Fragment key={item.url}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{item.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </React.Fragment>
            );
          return (
            <React.Fragment key={item.url}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={item.url}>{item.title}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
