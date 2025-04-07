import { GalleryVerticalEnd } from "lucide-react";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import { PAGE_URLS } from "@/lib/page-url";
import { InvitationForm } from "@/features/auth";

const InvitationPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const invitationId = (await params).id;
  const validLink =
    await api.registerMember.validateInvitationLink(invitationId);
  if (!validLink) redirect(PAGE_URLS.NOT_FOUND);

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <a href="#" className="flex items-center gap-2 self-center font-medium">
        <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-md">
          <GalleryVerticalEnd className="size-4" />
        </div>
        PhotoIn Corp.
      </a>
      <InvitationForm invitationId={invitationId} />
    </div>
  );
};

export default InvitationPage;
