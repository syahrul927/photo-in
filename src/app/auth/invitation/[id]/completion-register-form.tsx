import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
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
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const completionRegisterSchema = z
  .object({
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
  const form = useForm<CompletionRegisterType>({
    defaultValues,
    resolver: zodResolver(completionRegisterSchema),
  });
  const onSubmit = (value: CompletionRegisterType) => {
    console.log("value", value);
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
      <CardHeader className="text-left">
        <CardTitle className="text-left text-xl">
          <Button variant={"ghost"} size={"icon"} onClick={previous}>
            <ArrowLeft className="mr-2" />
          </Button>
          Welcome!
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-2">
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
                </div>
                <div className="grid gap-2">
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
                </div>
                <div className="grid gap-2">
                  <FormField
                    control={form.control}
                    name="repassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Re-Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Submit
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </motion.div>
  );
};
export default CompletionRegisterForm;
