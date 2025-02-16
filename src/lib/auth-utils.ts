import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";

export type Role = "owner" | "admin" | "member" | "viewer";

export const roles = [
  {
    value: "owner",
    label: "Owner",
    icon: ShieldAlert,
  },
  {
    value: "admin",
    label: "Admin",
    icon: ShieldCheck,
  },
  {
    value: "member",
    label: "Member",
    icon: Shield,
  },
] as const;
