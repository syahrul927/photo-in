import React from "react";
import { Separator } from "@/components/ui/separator";
import { InformationForm } from "./information-form";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3>Information</h3>
        <p className="text-muted-foreground text-sm">
          This is how others will see your team.
        </p>
      </div>
      <Separator />
      <InformationForm />
    </div>
  );
}
