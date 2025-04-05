"use client";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { roles } from "@/lib/auth-utils";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronDown, UserPlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const registerMemberFormSchema = z.object({
  email: z.string().email({ message: "Please insert valid email" }),
  role: z.string(),
  secretKey: z.string().min(6, { message: "Minimum 6 characters" }),
});

type RegisterMemberFormType = z.infer<typeof registerMemberFormSchema>;
const defaultValues: Partial<RegisterMemberFormType> = {
  email: "",
  role: "",
  secretKey: "",
};
interface AddMemberDialog {
  refetchMemberAction: () => void;
}

export const AddMemberDialog = ({ refetchMemberAction }: AddMemberDialog) => {
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { mutateAsync, isPending } =
    api.userMember.createInvitationMember.useMutation();

  const form = useForm<RegisterMemberFormType>({
    resolver: zodResolver(registerMemberFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const onSubmit = async (values: RegisterMemberFormType) => {
    await mutateAsync(values);

    setDialogOpen(false);
    refetchMemberAction();

    toast({
      title: "Success",
      description: "Member need to be confirm by user.",
    });
  };
  useEffect(() => {
    if (!dialogOpen) {
      form.reset();
    }
  }, [dialogOpen]);
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlusIcon className="mr-2 h-4 w-4" />
          Invite
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Invite a new member to join your team.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <Input {...field} placeholder="m@example.com" />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <Popover open={open} onOpenChange={setOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={open}
                              className="w-full justify-between"
                            >
                              {field.value
                                ? roles.find(
                                  (role) => role.value === field.value,
                                )?.label
                                : "Select Role..."}
                              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command className="w-full">
                              <CommandInput placeholder="Search role..." />
                              <CommandList>
                                <CommandEmpty>No role found.</CommandEmpty>
                                <CommandGroup>
                                  {roles.map((role) => {
                                    const RoleIcon = role.icon;
                                    return (
                                      <CommandItem
                                        key={role.value}
                                        onSelect={() => {
                                          form.setValue("role", role.value);
                                          setOpen(false);
                                        }}
                                      >
                                        <RoleIcon className="mr-2 h-4 w-4" />
                                        {role.label}
                                        {field.value === role.value && (
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
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="secretKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secret Key</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter>
              <Button isLoading={isPending} onClick={() => setOpen(false)}>
                Send Invitation
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
