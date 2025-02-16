"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { roles } from "@/lib/auth-utils";
import { Check, LucideIcon, MoreHorizontalIcon } from "lucide-react";

interface MemberCardProps {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: string;
  iconRole: LucideIcon;
  role: string;
}
const MemberCard = (member: MemberCardProps) => {
  return (
    <div
      key={member.id}
      className="flex items-center justify-between rounded-lg border p-3"
    >
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={member.avatar} alt={member.name} />
          <AvatarFallback>
            {member.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="grid gap-0.5">
          <div className="font-medium">{member.name}</div>
          <div className="text-muted-foreground text-xs">{member.email}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge
          variant={member.status === "active" ? "default" : "secondary"}
          className="hidden sm:inline-flex"
        >
          {member.status}
        </Badge>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 justify-start capitalize"
              disabled={member.role === "owner"}
            >
              <member.iconRole className="mr-2 h-4 w-4" />
              {member.role}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Search role..." />
              <CommandList>
                <CommandEmpty>No role found.</CommandEmpty>
                <CommandGroup>
                  {roles.map((role) => {
                    const RoleIcon = role.icon;
                    return (
                      <CommandItem
                        key={role.value}
                        value={role.value}
                        // onSelect={() => handleRoleChange(member.id, role.value)}
                        disabled={role.value === "owner"}
                      >
                        <RoleIcon className="mr-2 h-4 w-4" />
                        {role.label}
                        {member.role === role.value && (
                          <Check className="ml-auto h-4 w-4" />
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontalIcon className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(member.email)}
            >
              Copy email
            </DropdownMenuItem>
            <DropdownMenuItem>View profile</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 dark:text-red-400"
            // onClick={() => handleRemoveMember(member.id)}
            >
              Remove member
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
export default MemberCard;
