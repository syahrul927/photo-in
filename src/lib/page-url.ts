export const PAGE_URLS = {
  HOME: "/",
  // events
  EVENTS: "/events/",
  EVENTS_CREATE: "/events/create",
  EVENTS_EDIT: (id: string) => `/events/${id}/edit`,
  EVENTS_DETAIL: (id: string) => `/events/${id}`,
  EVENTS_UPLOAD_PHOTO: (id: string) => `/events/${id}/upload`,

  // settings
  SETTINGS: "/settings",
  SETTINGS_MEMBER: "/settings/members",

  SUPPORT: "/support",
  FEEDBACK: "/feedback",

  LOGIN: "/auth/login",
  NOT_FOUND: "/404",
} as const;
