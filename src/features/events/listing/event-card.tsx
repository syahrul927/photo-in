import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PAGE_URLS } from "@/lib/page-url";
import { type EventStatusType } from "@/types/event-status";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Calendar, MapPin, MoreVertical } from "lucide-react";
import Link from "next/link";
import { BadgeList } from "./badge-list";

interface EventCardProps {
  id: string;
  index: number;
  name: string;
  clientName?: string | null;
  dateEvent?: Date | null;
  location?: string | null;
  status: EventStatusType;
  categories: string[];
  targetTotalPhotos?: string | number | null;
  onOpenStatusDialog: (id: string) => void;
}

const statusColors: { [key in EventStatusType]: string } = {
  upcoming: "bg-blue-500/10 text-blue-500",
  "in-progress": "bg-yellow-500/10 text-yellow-500",
  completed: "bg-green-500/10 text-green-500",
};

const statusText: { [key in EventStatusType]: string } = {
  upcoming: "Upcoming",
  "in-progress": "In Progress",
  completed: "Completed",
};
export const EventCard = (props: EventCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 * props.index }}
    >
      <Link href={PAGE_URLS.EVENTS_DETAIL(props.id)}>
        <Card className="hover:bg-foreground/10 overflow-hidden hover:cursor-pointer">
          <CardContent>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">{props.name}</h3>
                <p className="text-muted-foreground text-sm">
                  {props.clientName}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Gallery</DropdownMenuItem>
                  <Link href={PAGE_URLS.EVENTS_EDIT(props.id)}>
                    <DropdownMenuItem>Edit Information</DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      props.onOpenStatusDialog(props.id);
                    }}
                  >
                    Change Status
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    Archive Event
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mt-4 space-y-3">
              {props.dateEvent && (
                <div className="flex items-center text-sm">
                  <Calendar className="text-muted-foreground mr-2 h-4 w-4" />
                  {format(props.dateEvent, "PPP")}
                </div>
              )}
              <div className="flex items-center text-sm">
                <MapPin className="text-muted-foreground mr-2 h-4 w-4" />
                {props.location}
              </div>
              <div className="flex items-center justify-between">
                <Badge
                  variant="secondary"
                  className={statusColors[props.status]}
                >
                  {statusText[props.status]}
                </Badge>
                <div className="flex flex-wrap gap-1">
                  <BadgeList categories={props.categories} maxVisible={2} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};
