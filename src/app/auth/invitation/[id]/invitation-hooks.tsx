import { createContext, useContext, useState, ReactNode } from "react";
import { z } from "zod";

const InvitationSchema = z.object({
  email: z.string().email().optional(),
  secretKey: z
    .string()
    .min(6, "Secret key must be at least 6 characters")
    .optional(),
  name: z.string().min(2, "Name must have at least 2 characters").optional(),
  invitationId: z.string().uuid().optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
});

type InvitationData = z.infer<typeof InvitationSchema>;

const defaultInvitationData: InvitationData = {
  email: undefined,
  secretKey: undefined,
  name: undefined,
  invitationId: undefined,
  password: undefined,
};

const InvitationContext = createContext<{
  invitation: InvitationData;
  setInvitation: (data: InvitationData) => void;
}>({
  invitation: defaultInvitationData,
  setInvitation: () => {},
});

export const InvitationProvider = ({ children }: { children: ReactNode }) => {
  const [invitation, setInvitation] = useState<InvitationData>(
    defaultInvitationData,
  );

  return (
    <InvitationContext.Provider value={{ invitation, setInvitation }}>
      {children}
    </InvitationContext.Provider>
  );
};

export const useInvitation = () => {
  const context = useContext(InvitationContext);
  if (!context) {
    throw new Error("useInvitation must be used within an InvitationProvider");
  }
  return context;
};
