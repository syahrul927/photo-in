"use client";
import ContentLayout from "@/components/layout/content-layout";
import { ContentLayoutSkeleton } from "@/components/layout/content-layout-skeleton";
import { EventForm, EventFormSkeleton } from "@/features/events";
import { api } from "@/trpc/react";
import { notFound, useParams } from "next/navigation";

const EditEventPage = () => {
  const params = useParams<{ id: string }>();

  if (!params?.id) return notFound();

  const { isLoading, data } = api.event.getEventByEventId.useQuery(params.id);
  if (isLoading) {
    return (
      <ContentLayoutSkeleton>
        <EventFormSkeleton />
      </ContentLayoutSkeleton>
    );
  }

  if (!data) return notFound();
  return (
    <ContentLayout
      title="Edit Event"
      description="Don't forget to fill the required information"
    >
      <EventForm mode={"edit"} values={data} />
    </ContentLayout>
  );
};
export default EditEventPage;
