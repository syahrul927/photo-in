import { NavigationType } from "@/components/sidebar/types";
import {
  CalendarIcon,
  HomeIcon,
  LifeBuoyIcon,
  SendIcon,
  SettingsIcon,
} from "lucide-react";

export const NavigationMainConstant: NavigationType[] = [
  {
    title: "Home",
    code: "access:home",
    url: "/",
    icon: HomeIcon,
  },
  {
    title: "Event Management",
    code: "access:event-management",
    url: "/events",
    icon: CalendarIcon,
    items: [
      {
        title: "Create Event",
        url: "/events/create",
      },
      {
        title: "Manage Events",
        url: "/events/manage",
      },
    ],
  },
];

export const NavigationSecondaryConstant: NavigationType[] = [
  {
    title: "Settings",
    url: "/settings",
    icon: SettingsIcon,
    code: "access:settings",
  },
  {
    title: "Support",
    url: "/support",
    icon: LifeBuoyIcon,
    code: "access:support",
  },
  {
    title: "Feedback",
    url: "/feedback",
    icon: SendIcon,
    code: "access:feedback",
  },
];
export const NavigationSettingsConstant: Omit<
  NavigationType,
  "code" | "icon"
>[] = [
    {
      title: "Information",
      url: "/settings",
    },
    {
      title: "Members",
      url: "/settings/members",
    },
  ];
