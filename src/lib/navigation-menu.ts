import { NavigationType } from "@/components/sidebar/types";
import {
  CalendarIcon,
  HomeIcon,
  LifeBuoyIcon,
  SendIcon,
  SettingsIcon,
} from "lucide-react";
import { PAGE_URLS } from "./page-url";

export const NavigationMainConstant: NavigationType[] = [
  {
    title: "Home",
    code: "access:home",
    url: PAGE_URLS.HOME,
    icon: HomeIcon,
  },
  {
    title: "Events",
    code: "access:event-management",
    url: PAGE_URLS.EVENTS,
    icon: CalendarIcon,
    items: [
      {
        url: PAGE_URLS.EVENTS_CREATE,
        title: "Create Event",
        hide: true,
      },
      {
        url: PAGE_URLS.EVENTS_EDIT("*"),
        title: "Edit Event",
        hide: true,
      },
      {
        url: PAGE_URLS.EVENTS_DETAIL("*"),
        title: "Event Details",
        hide: true,
      },
      {
        url: PAGE_URLS.EVENTS_UPLOAD_PHOTO("*"),
        title: "Upload Photo",
        hide: true,
      },
    ],
  },
];

export const NavigationSecondaryConstant: NavigationType[] = [
  {
    title: "Settings",
    url: PAGE_URLS.SETTINGS,
    icon: SettingsIcon,
    code: "access:settings",
  },
  {
    title: "Support",
    url: PAGE_URLS.SUPPORT,
    icon: LifeBuoyIcon,
    code: "access:support",
  },
  {
    title: "Feedback",
    url: PAGE_URLS.FEEDBACK,
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
    url: PAGE_URLS.SETTINGS,
  },
  {
    title: "Members",
    url: PAGE_URLS.SETTINGS_MEMBER,
  },
];
