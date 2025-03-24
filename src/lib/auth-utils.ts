import { Role } from "@/config/permissions";
import { LucideIcon, Shield, ShieldAlert, ShieldCheck } from "lucide-react";

export const roles: { label: string; icon: LucideIcon; value: Role }[] = [
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
