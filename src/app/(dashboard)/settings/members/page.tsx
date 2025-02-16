"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { roles } from "@/lib/auth-utils";
import { api } from "@/trpc/react";
import { Loader2Icon, Shield } from "lucide-react";
import DialogAddMember from "./dialog-add-member";
import MemberCard from "./member-card";

function MembersPage() {
	const {
		data: members,
		isLoading,
		refetch,
	} = api.userMember.getListMemberTeam.useQuery();

	if (isLoading) {
		return (
			<div className="flex w-full items-center justify-center">
				<Loader2Icon className="animate-spin" />
			</div>
		);
	}
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
			{members?.length ? (
				<ScrollArea className="h-[48rem]">
					<div className="space-y-3">
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
					</div>
				</ScrollArea>
			) : (
				<div className="flex w-full items-center justify-center p-3">
					<p>No member Registered</p>
				</div>
			)}
		</div>
	);
}

export default MembersPage;
