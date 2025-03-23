import { GalleryVerticalEnd } from "lucide-react";
import InvitationForm from "./invitation-form";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";

const InvitationPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const invitationId = (await params).id;
  const validLink =
    await api.registerMember.validateInvitationLink(invitationId);
  if (!validLink) redirect("/404");

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <a href="#" className="flex items-center gap-2 self-center font-medium">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <GalleryVerticalEnd className="size-4" />
        </div>
        PhotoIn Corp.
      </a>
      <InvitationForm invitationId={invitationId} />
    </div>
  );
};

export default InvitationPage;
