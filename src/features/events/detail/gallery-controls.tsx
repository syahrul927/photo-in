"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Filter, Grid, LayoutGrid } from "lucide-react";

export type ViewMode = "grid" | "masonry";
export type SortBy = "newest" | "oldest" | "name";

interface GalleryControlsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortBy: SortBy;
  onSortByChange: (sort: SortBy) => void;
  photoCount: number;
}

export function GalleryControls({
  viewMode,
  onViewModeChange,
  sortBy,
  onSortByChange,
  photoCount,
}: GalleryControlsProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold">
          Photos ({photoCount})
        </h2>
        
        {/* View Mode Toggle */}
        <div className="flex rounded-lg border p-1">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("grid")}
            className="h-8 px-3"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "masonry" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("masonry")}
            className="h-8 px-3"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Sort Controls */}
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>

        {/* Action Buttons */}
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4" />
          Download All
        </Button>
      </div>
    </div>
  );
}