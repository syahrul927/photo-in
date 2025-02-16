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
import { useState } from "react";
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

const ValidationEmailForm = ({
  step,
  next,
}: {
  step: number;
  next: () => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<ValidationEmailType>({
    defaultValues,
    resolver: zodResolver(validationEmailSchema),
  });

  const onSubmit = (value: ValidationEmailType) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      next();
    }, 1500);
  };
  return (
    <motion.div
      initial={{ x: 0, opacity: 1 }}
      animate={{
        x: step === 1 ? 0 : "-100%",
        opacity: step === 1 ? 1 : 0,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="w-full"
      style={{
        position: step === 1 ? "relative" : "absolute",
        top: 0,
        left: 0,
        width: "100%",
      }}
    >
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Welcome</CardTitle>
        <CardDescription>
          Enter the email that was invited by your leader.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-2">
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
                </div>
                <div className="grid gap-2">
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
                <Button isLoading={isLoading} type="submit" className="w-full">
                  Next
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </motion.div>
  );
};
export default ValidationEmailForm;
