"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { IconName, IconPicker } from "@/components/ui/icon-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useWorkspace } from "@/hooks/use-workspace";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const updateInformationFormSchema = z.object({
  id: z.string(),
  icon: z.string(),
  name: z
    .string()
    .min(2, {
      message: "Username must be at least 2 characters.",
    })
    .max(30, {
      message: "Username must not be longer than 30 characters.",
    }),
  description: z.string(),
});

type UpdateInformationFormValues = z.infer<typeof updateInformationFormSchema>;

export function UpdateInformationForm() {
  const { activeWorkspace } = useWorkspace();
  const form = useForm<UpdateInformationFormValues>({
    resolver: zodResolver(updateInformationFormSchema),
    values: {
      description: activeWorkspace?.description ?? "",
      name: activeWorkspace?.name ?? "",
      icon: activeWorkspace?.icon ?? "shell",
      id: activeWorkspace?.workspaceId ?? "",
    },
    mode: "onChange",
  });

  const isMember =
    activeWorkspace?.role !== "admin" && activeWorkspace?.role !== "owner";

  function onSubmit(data: UpdateInformationFormValues) {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon</FormLabel>
              <FormControl>
                <div className="w-fit">
                  <IconPicker
                    disabled={isMember}
                    value={field.value as IconName}
                    onValueChange={(value) => field.onChange(value)}
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input disabled={isMember} placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name. It can be your real name or a
                pseudonym.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <Textarea
                disabled={isMember}
                {...field}
                placeholder="Describe your team here."
              />
              <FormDescription>
                Write everything about this team.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button disabled={!form.formState.isDirty || isMember} type="submit">
          Update profile
        </Button>
      </form>
    </Form>
  );
}
