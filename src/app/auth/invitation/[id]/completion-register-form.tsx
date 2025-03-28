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
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useInvitation } from "./invitation-hooks";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const completionRegisterSchema = z
  .object({
    email: z.string(),
    password: z.string().min(6, { message: "Must be at least 6 characters." }),
    repassword: z
      .string()
      .min(6, { message: "Must be at least 6 characters." }),
    name: z.string(),
  })
  .refine((data) => data.password === data.repassword, {
    message: "Password doesn't match",
    path: ["repassword"],
  });

type CompletionRegisterType = z.infer<typeof completionRegisterSchema>;
const defaultValues: Partial<CompletionRegisterType> = {
  password: "",
  repassword: "",
  name: "",
};

const CompletionRegisterForm = ({
  step,
  previous,
}: {
  step: number;
  previous: () => void;
}) => {
  const { invitation } = useInvitation();
  const form = useForm<CompletionRegisterType>({
    defaultValues: {
      ...defaultValues,
      email: invitation.email,
    },
    resolver: zodResolver(completionRegisterSchema),
  });

  const router = useRouter();

  const { toast } = useToast();

  const { mutateAsync, isPending } =
    api.registerMember.registerInformationUser.useMutation();

  const onSubmit = async ({ name, password }: CompletionRegisterType) => {
    const { email, invitationId, secretKey } = invitation;
    if (!email || !invitationId || !secretKey) return;
    await mutateAsync({
      name,
      password,
      email,
      invitationId,
      secretKey,
    });

    toast({
      title: "Registration Successful",
      description: "The user has been registered successfully.",
    });
    return router.push("/auth/login");
  };
  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{
        x: step === 2 ? 0 : "100%",
        opacity: step === 2 ? 1 : 0,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="w-full"
      style={{
        position: step === 2 ? "relative" : "absolute",
        top: 0,
        left: 0,
        width: "100%",
      }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader className="text-left">
            <CardTitle className="text-start">Register Account</CardTitle>
            <CardDescription className="text-start">
              Fill the information below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-1.5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input disabled {...field} />
                    </FormControl>
                    <FormMessage />
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
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="repassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button isLoading={isPending} type="submit">
              Submit
            </Button>
          </CardFooter>
        </form>
      </Form>
    </motion.div>
  );
};
export default CompletionRegisterForm;
