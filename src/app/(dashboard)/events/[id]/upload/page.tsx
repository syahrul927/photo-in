import ContentLayout from "@/components/layout/content-layout";
import { ImageUploader } from "@/features/gallery";

const CreateEventPage = () => {
  return (
    <ContentLayout title="Upload Photo">
      <ImageUploader />
    </ContentLayout>
  );
};
export default CreateEventPage;
