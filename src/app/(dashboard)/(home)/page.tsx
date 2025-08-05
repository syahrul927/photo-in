import ContentLayout from "@/components/layout/content-layout";
import type { Metadata } from "next";
import { HomeDashboard } from "@/features/home/home-dashboard";

export const metadata: Metadata = {
  title: "Dashboard - Photo Management",
  description: "Manage your photography events, upload photos, and track progress all in one place.",
};

const HomePage = () => {
  return (
    <ContentLayout title="Dashboard" description="Manage your photography events, upload photos, and track progress">
      <HomeDashboard />
    </ContentLayout>
  );
};

export default HomePage;