import React from "react";
import { Separator } from "@/components/ui/separator";
import { UpdateInformationForm } from "@/features/settings-information";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3>Information</h3>
        <p className="text-sm text-muted-foreground">
          This is how others will see your team.
        </p>
      </div>
      <Separator />
      <UpdateInformationForm />
    </div>
  );
}
