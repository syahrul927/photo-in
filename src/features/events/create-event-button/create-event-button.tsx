import { Button } from "@/components/ui/button";
import { PAGE_URLS } from "@/lib/page-url";
import { Calendar } from "lucide-react";
import Link from "next/link";

export function CreateEventButton() {
  return (
    <Button className="w-full md:w-auto" asChild>
      <Link href={PAGE_URLS.EVENTS_CREATE}>
        <Calendar className="mr-2 h-4 w-4" />
        Create New Event
      </Link>
    </Button>
  );
}
