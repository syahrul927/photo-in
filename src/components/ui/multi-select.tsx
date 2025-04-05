"use client";

import * as React from "react";
import { X, Check, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export type Option = {
  value: string;
  label: string;
};

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  className?: string;
  emptyMessage?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  className,
  emptyMessage = "No options found.",
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Focus the input when the popover opens
  React.useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [open]);

  const handleUnselect = (value: string) => {
    onChange(selected.filter((item) => item !== value));
  };

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
    // Keep focus on the input after selection
    inputRef.current?.focus();
  };

  // Filter options based on search query
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Get selected item labels for display
  const selectedItems = selected
    .map((value) => {
      return options.find((option) => option.value === value);
    })
    .filter(Boolean) as Option[];

  return (
    <div className="flex flex-col space-y-1">
      <div className="flex flex-wrap items-center gap-1">
        {selectedItems.length > 0
          ? selectedItems.map((item) => (
              <Badge key={item.value} variant="secondary" className="mb-1 mr-1">
                {item.label}
                <Button
                  size={"icon"}
                  className="size-6"
                  variant={"ghost"}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleUnselect(item.value);
                  }}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove {item.label}</span>
                </Button>
              </Badge>
            ))
          : null}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "h-auto min-h-[2.5rem] w-full justify-between text-left",
              className,
            )}
            onClick={() => setOpen(!open)}
          >
            Add Categories
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
        >
          <div className="p-2">
            <Input
              ref={inputRef}
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9"
            />
          </div>
          <ul className="max-h-[300px] overflow-auto p-2 pt-0">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <li
                    key={option.value}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm",
                      isSelected ? "bg-accent" : "hover:bg-muted",
                    )}
                    onClick={() => handleSelect(option.value)}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check className="h-4 w-4" />}
                  </li>
                );
              })
            ) : (
              <li className="px-2 py-4 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </li>
            )}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  );
}
