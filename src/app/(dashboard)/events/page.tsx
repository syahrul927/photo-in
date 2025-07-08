"use client";

import { motion } from "framer-motion";
import { Filter, ImageIcon, Loader2, Search } from "lucide-react";
import { useState } from "react";

import ContentLayout from "@/components/layout/content-layout";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EventCategories } from "@/lib/event-categories";
import { api } from "@/trpc/react";
import {
  CreateEventButton,
  EventCard,
  EventCardSkeleton,
} from "@/features/events";
import EventStatusDialog from "@/features/events/event-status-dialog/event-status-dialog";
import { EventStatusType } from "@/types/event-status";
import { useToast } from "@/hooks/use-toast";

export default function EventPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [eventStatusDialog, setEventStatusDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<{
    id: string;
    status: EventStatusType;
  }>();
  const { toast } = useToast();

  const {
    data: events,
    refetch: reloadEvent,
    isLoading,
  } = api.event.getEventsByWorkspace.useQuery();

  const filteredEvents =
    events?.filter((event) => {
      const matchesSearch =
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || event.status === statusFilter;
      const matchesType =
        typeFilter === "all" || event.categories.includes(typeFilter);
      return matchesSearch && matchesStatus && matchesType;
    }) ?? [];

  const handleOnOpenStatusDialog = (id: string) => {
    const event = events?.find((e) => e.id === id);
    if (event) {
      setSelectedEvent({ id, status: event.status });
      setEventStatusDialog(true);
    }
  };

  const { mutateAsync: updateStatusEvent, isPending } =
    api.event.updateStatusEvent.useMutation();

  const submitUpdateStatus = async (status: EventStatusType) => {
    if (selectedEvent) {
      updateStatusEvent({ id: selectedEvent.id, status })
        .then(() => {
          void reloadEvent();
          toast({
            title: "Status Updated",
            description: `Successfully change status.`,
          });
          setEventStatusDialog(false);
        })
        .catch((e) => {
          const errorMessage =
            e instanceof Error ? e.message : "An unknown error occurred";

          toast({
            variant: "destructive",
            title: "Update Failed",
            description:
              errorMessage ?? "An unexpected error occurred. Please try again.",
          });
        });
    }
  };

  return (
    <ContentLayout
      title="Events"
      description="Manage Your Photography Events with Ease"
      rightHeaderComponent={<CreateEventButton />}
    >
      <motion.div
        className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex-1">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
            <Input
              placeholder="Search events, clients, or locations..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <ImageIcon className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {EventCategories.map((event) => (
                <SelectItem key={event.value} value={event.value}>
                  {event.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      <motion.div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <EventCardSkeleton key={index} index={index} />
            ))
          : filteredEvents.length == 0 && (
              <div className="flex min-h-48 items-center justify-center md:col-span-2 lg:col-span-3">
                <p className="text-muted-foreground text-center">
                  No events found. Please check back later or adjust your
                  filters.
                </p>
              </div>
            )}
        {filteredEvents.map((event, index) => (
          <EventCard
            key={event.id}
            {...event}
            index={index}
            onOpenStatusDialog={handleOnOpenStatusDialog}
          />
        ))}
      </motion.div>
      <EventStatusDialog
        initialStatus={selectedEvent?.status}
        open={eventStatusDialog}
        setOpen={setEventStatusDialog}
        isLoading={isPending}
        onSubmit={submitUpdateStatus}
      />
    </ContentLayout>
  );
}
