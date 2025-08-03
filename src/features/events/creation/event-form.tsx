"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, MapPinIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { EventCategories } from "@/lib/event-categories";
import { PAGE_URLS } from "@/lib/page-url";
import { api } from "@/trpc/react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, {
    message: "Event name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  location: z.string().optional(),
  date: z.date().optional(),
  clientName: z.string().optional(),
  targetPhotos: z.coerce
    .number()
    .int()
    .positive({
      message: "Target photos must be a positive number.",
    })
    .optional(),
  categories: z.array(z.string()).min(1, {
    message: "Select at least one category.",
  }),
});

type FormType = z.infer<typeof formSchema>;

type EventFormProps =
  | {
    mode: "edit";
    values: FormType;
  }
  | {
    mode?: "create";
  };

const defaultValues: Partial<FormType> = {
  name: "",
  description: "",
  clientName: "",
  location: "",
  targetPhotos: 100,
  categories: [],
};
export const EventForm = (props: EventFormProps) => {
  const { toast } = useToast();

  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues:
      props.mode === "edit"
        ? {
          ...props.values,
        }
        : defaultValues,
    mode: "onSubmit",
  });

  const { mutateAsync, isPending } = api.event.upsertEvent.useMutation();
  const router = useRouter();

  function onSubmit(values: FormType) {
    mutateAsync({
      id: values.id,
      name: values.name,
      location: values.location,
      description: values.description,
      dateEvent: values.date,
      targetTotalPhotos: values.targetPhotos,
      categories: values.categories,
      clientName: values.clientName,
    })
      .then((response) => {
        toast({
          title: "Event created",
          description: `Successfully ${props.mode === "create" ? "created" : "updated"} event: ${response?.name}`,
        });
        void router.push(PAGE_URLS.EVENTS);
      })
      .catch((e) => {
        const errorMessage =
          e instanceof Error ? e.message : "An unknown error occurred";

        toast({
          variant: "destructive",
          title: `Event failed to ${props.mode === "create" ? "create" : "update"}`,
          description: errorMessage,
        });
      });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-screen-md space-y-6"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Wedding, Corporate Event, etc."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The name of your photography event.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="clientName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter client name if applicable"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The name of the client for this event.
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
              <FormControl>
                <Textarea
                  placeholder="Provide details about the event..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Describe the event, client requirements, and any special notes.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-x-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <div className="relative">
                    <MapPinIcon className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                    <Input
                      className="pl-10"
                      placeholder="Event venue or address"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Select date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="targetPhotos"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Total Photos</FormLabel>
              <FormControl>
                <Input type="number" min={1} {...field} />
              </FormControl>
              <FormDescription>
                The number of photos you aim to deliver for this event.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categories"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categories</FormLabel>
              <MultiSelect
                options={EventCategories}
                selected={field.value}
                onChange={field.onChange}
                emptyMessage="No matching categories found."
              />
              <FormDescription>
                Select one or more categories that describe this event.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4">
          <Button
            type="submit"
            isLoading={isPending}
            className="mr-4 capitalize"
          >
            {props.mode ?? "Create"} Event
          </Button>
          <Button
            type="button"
            disabled={isPending}
            onClick={() => void router.back()}
            variant="outline"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};
