"use client";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useInvitation } from "@/hooks/use-invitation";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";

const validationEmailSchema = z.object({
  email: z.string().email({ message: "Please enter valid email" }),
  secretKey: z.string(),
});

type ValidationEmailType = z.infer<typeof validationEmailSchema>;
const defaultValues: Partial<ValidationEmailType> = {
  email: "",
  secretKey: "",
};

export const ValidationEmailForm = ({
  invitationId,
  step,
  next,
}: {
  invitationId: string;
  step: number;
  next: () => void;
}) => {
  const form = useForm<ValidationEmailType>({
    defaultValues,
    resolver: zodResolver(validationEmailSchema),
  });

  const { toast } = useToast();
  const { setInvitation, invitation } = useInvitation();

  const { mutateAsync, isPending } =
    api.registerMember.validateInvitationEmailKey.useMutation();

  const onSubmit = async ({ email, secretKey }: ValidationEmailType) => {
    const result = await mutateAsync({
      email,
      secretKey,
      invitationId,
    });
    if (result) {
      setInvitation({ ...invitation, email, secretKey, invitationId });
      next();
      return;
    }
    toast({
      title: "Invalid Invitation Link",
      description:
        "Please verify that the provided email and secret key are correct.",
      variant: "destructive",
    });
  };
  return (
    <motion.div
      initial={{ x: 0, opacity: 1 }}
      animate={{
        x: step === 1 ? 0 : "-100%",
        opacity: step === 1 ? 1 : 0,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex w-full flex-col gap-6" // from card style
      style={{
        position: step === 1 ? "relative" : "absolute",
        top: 0,
        left: 0,
        width: "100%",
      }}
    >
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
        <CardDescription>
          Enter the email that was invited by your leader.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <CardContent className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="m@example.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
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
          </CardContent>
          <CardFooter>
            <Button isLoading={isPending} type="submit" className="w-full">
              Next
            </Button>
          </CardFooter>
        </form>
      </Form>
    </motion.div>
  );
};
