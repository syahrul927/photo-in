"use client";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { InvitationProvider } from "@/hooks/use-invitation";
import { ValidationEmailForm } from "./validation-email-form";
import CompletionRegisterForm from "./completion-register-form";

export const InvitationForm = ({ invitationId }: { invitationId: string }) => {
  const [step, setStep] = useState(1);
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="relative overflow-hidden">
          <div className="relative">
            <InvitationProvider>
              <ValidationEmailForm
                invitationId={invitationId}
                step={step}
                next={() => setStep(2)}
              />
              <CompletionRegisterForm step={step} previous={() => setStep(1)} />
            </InvitationProvider>
          </div>
        </div>
      </Card>
    </div>
  );
};
