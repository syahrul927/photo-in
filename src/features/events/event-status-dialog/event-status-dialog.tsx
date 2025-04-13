"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EventStatusType } from "@/types/event-status";
import { useEffect, useState } from "react";

const statuses: { value: EventStatusType; label: string }[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

interface EventStatusDialogProps {
  initialStatus?: EventStatusType;
  onSubmit: (status: EventStatusType) => void;
  eventId?: string;
  open?: boolean;
  setOpen: (open: boolean) => void;
  isLoading?: boolean;
}

export default function EventStatusDialog({
  initialStatus = "upcoming",
  open,
  onSubmit,
  setOpen,
  isLoading,
}: EventStatusDialogProps) {
  const [status, setStatus] = useState<EventStatusType>(initialStatus);

  useEffect(() => {
    if (open) {
      setStatus(initialStatus);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Event Status</DialogTitle>
          <DialogDescription>
            Update the status of this event using the dropdown below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="status" className="text-right text-sm font-medium">
              Status
            </label>
            <div className="col-span-3">
              <Select
                value={status}
                onValueChange={(e) => setStatus(e as EventStatusType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    aria-label={statuses.find((s) => s.value === status)?.label}
                  ></SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(({ label, value }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button isLoading={isLoading} onClick={() => onSubmit(status)}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
