"use client";
import ContentLayout from "@/components/layout/content-layout";
import { ImageUploaderParallel } from "@/features/gallery/image-uploader/image-uploader-parallel";
import { notFound, useParams } from "next/navigation";

const CreateEventPage = () => {
  const params = useParams<{ id: string }>();
  if (!params?.id) return notFound();
  return (
    <ContentLayout title="Upload Photo">
      <ImageUploaderParallel eventId={params.id} />
    </ContentLayout>
  );
};
export default CreateEventPage;
