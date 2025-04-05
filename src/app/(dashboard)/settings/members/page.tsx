"use client";
import AccessControl from "@/components/commons/access-control";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AddMemberDialog,
  MemberCard,
  MemberCardSkeleton,
} from "@/features/settings-members";
import { useWorkspace } from "@/hooks/use-workspace";
import { roles } from "@/lib/auth-utils";
import { MemberViewType } from "@/server/api/routers/user-member-router/query/type";
import { api } from "@/trpc/react";
import { Shield } from "lucide-react";
import { useCallback } from "react";

function MembersPage() {
  const {
    data: membersActive,
    isLoading: isLoadingMemberActive,
    refetch: refetchMemberActive,
  } = api.userMember.getListMemberActive.useQuery();
  const {
    data: membersPending,
    isLoading: isLoadingMemberPending,
    refetch: refetchMemberPending,
  } = api.userMember.getListMemberPending.useQuery();

  const refetchAll = useCallback(async () => {
    await Promise.all([refetchMemberActive(), refetchMemberPending()]);
  }, [refetchMemberPending, refetchMemberActive]);

  const { activeWorkspace } = useWorkspace();
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex w-full items-center justify-between">
        <div className="basis-2/3">
          <h3>Team Member</h3>
          <p className="text-muted-foreground text-sm">
            Manage your team members with ease. Invite, assign roles, and
            control access to your workspace.
          </p>
        </div>
        <AccessControl
          role={activeWorkspace?.role}
          feature="invitation"
          permission="write"
        >
          <AddMemberDialog refetchMemberAction={refetchAll} />
        </AccessControl>
      </div>
      <Separator />
      <Tabs defaultValue="active">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <ScrollArea className="max-h-[36rem]">
            <div className="space-y-3">
              <ListMember
                members={membersActive ?? []}
                isLoading={isLoadingMemberActive}
              />
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="pending">
          <ScrollArea className="max-h-[36rem]">
            <div className="space-y-3">
              <ListMember
                members={membersPending ?? []}
                isLoading={isLoadingMemberPending}
              />
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MembersPage;

const ListMember = ({
  members,
  isLoading,
}: {
  isLoading?: boolean;
  members: MemberViewType[];
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
        <p className="text-muted-foreground">No member registered</p>
      </div>
    );
  }
  return (
    <>
      {members.map(({ name, ...member }) => {
        const roleData = roles.find((r) => r.value === member.role);
        const RoleIcon = roleData?.icon || Shield;
        return (
          <MemberCard
            key={member.id}
            avatar=""
            {...member}
            name={name ?? member.email}
            iconRole={RoleIcon}
          />
        );
      })}
    </>
  );
};
