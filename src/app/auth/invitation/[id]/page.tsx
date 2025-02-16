import { GalleryVerticalEnd } from "lucide-react";
import InvitationForm from "./invitation-form";

const InvitationPage = () => {
	return (
		<div className="flex w-full max-w-sm flex-col gap-6">
			<a href="#" className="flex items-center gap-2 self-center font-medium">
				<div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
					<GalleryVerticalEnd className="size-4" />
				</div>
				PhotoIn Corp.
			</a>
			<InvitationForm />
		</div>
	);
};

export default InvitationPage;
