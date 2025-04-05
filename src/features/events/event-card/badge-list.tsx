"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BadgeListProps {
  categories?: string[];
  maxVisible?: number;
}

export function BadgeList({ categories = [], maxVisible = 3 }: BadgeListProps) {
  const [showAll, setShowAll] = useState(false);

  const visibleCategories = showAll
    ? categories
    : categories.slice(0, maxVisible);
  const remainingCount = categories.length - maxVisible;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {visibleCategories.map((category) => (
        <Badge key={category} variant="outline" className="capitalize">
          {category}
        </Badge>
      ))}

      {!showAll && remainingCount > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className="cursor-pointer"
              // onClick={() => setShowAll(true)}
              >
                +{remainingCount} more
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex flex-col gap-1">
                {categories.slice(maxVisible).map((category) => (
                  <span key={category} className="capitalize">
                    {category}
                  </span>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
