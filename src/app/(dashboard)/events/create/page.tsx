import ContentLayout from "@/components/layout/content-layout";
import { EventForm } from "@/features/events";

const CreateEventPage = () => {
  return (
    <ContentLayout
      title="Create a New Event"
      description="Set up a new client event—don’t forget to fill in all details! 📸"
    >
      <EventForm />
    </ContentLayout>
  );
};
export default CreateEventPage;
