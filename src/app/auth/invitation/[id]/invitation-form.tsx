"use client";
import { Card } from "@/components/ui/card";
import ValidationEmailForm from "./validation-email-form";
import { useState } from "react";
import CompletionRegisterForm from "./completion-register-form";
import { InvitationProvider } from "./invitation-hooks";

const InvitationForm = ({ invitationId }: { invitationId: string }) => {
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
export default InvitationForm;
