"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { roles } from "@/lib/auth-utils";
import { api, RouterOutputs } from "@/trpc/react";
import { Loader2Icon, Shield } from "lucide-react";
import DialogAddMember from "./dialog-add-member";
import MemberCard from "./member-card";
import { MemberCardSkeleton } from "./member-card-skeleton";

function MembersPage() {
	const {
		data: members,
		isLoading,
		refetch,
	} = api.userMember.getListMemberTeam.useQuery();
	return (
		<div className="flex flex-col space-y-6">
			<div className="flex w-full items-center justify-between">
				<div className="basis-2/3">
					<h3>Team Member</h3>
					<p className="text-sm text-muted-foreground">
						Manage your team members with ease. Invite, assign roles, and
						control access to your workspace.
					</p>
				</div>
				<DialogAddMember refetchMember={refetch} />
			</div>
			<Separator />
			<ScrollArea className="h-[48rem]">
				<div className="space-y-3">
					<ListMember members={members ?? []} isLoading={isLoading} />
				</div>
			</ScrollArea>
		</div>
	);
}

export default MembersPage;

const ListMember = ({
	members,
	isLoading,
}: {
	isLoading?: boolean;
	members: RouterOutputs["userMember"]["getListMemberTeam"];
}) => {
	if (isLoading) {
		return (
			<>
				{Array.from({ length: 5 }).map((_, index) => (
					<MemberCardSkeleton key={index} />
				))}
			</>
		);
	}
	if (members.length === 0) {
		return (
			<div className="flex w-full items-center justify-center p-3">
				<p>No member Registered</p>
			</div>
		);
	}
	return (
		<>
			{members.map((member) => {
				const roleData = roles.find((r) => r.value === member.role);
				const RoleIcon = roleData?.icon || Shield;
				return (
					<MemberCard
						key={member.id}
						avatar=""
						{...member}
						iconRole={RoleIcon}
					/>
				);
			})}
		</>
	);
};
