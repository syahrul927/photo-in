"use client";

import { EventGallery } from "@/features/events";
import { useParams } from "next/navigation";

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;

  return <EventGallery eventId={eventId} />;
}