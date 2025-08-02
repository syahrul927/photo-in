import { getWorkspaceHeader } from "@/lib/workspace-utils";
import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "@/server/auth";
import { type Workspace } from "@/types/next-auth";
import { type Session } from "next-auth";

export interface AuthPagesRequest extends NextApiRequest {
  session: Session;
  currentWorkspace: Workspace;
}

export async function requireAuthWithWorkspace(
  req: NextApiRequest,
  res: NextApiResponse,
  next: (err?: unknown) => void,
) {
  const session = await auth(req, res);
  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const fetchHeaders = new Headers();
  for (const [key, val] of Object.entries(req.headers)) {
    if (typeof val === "string") {
      fetchHeaders.set(key, val);
    } else if (Array.isArray(val)) {
      val.forEach((v) => fetchHeaders.append(key, v));
    }
  }

  // 3) Extract workspace key
  const keyWorkspace = getWorkspaceHeader(fetchHeaders);
  if (!keyWorkspace) {
    return res.status(400).json({ error: "Missing currentWorkspace header" });
  }

  // 4) Validate workspace
  const currentWorkspace = session.user.workspaces?.find(
    (ws) => ws.keyWorkspace === keyWorkspace,
  );
  if (!currentWorkspace) {
    return res
      .status(403)
      .json({ error: "Forbidden: workspace not found in your account" });
  }

  (req as AuthPagesRequest).session = session;
  (req as AuthPagesRequest).currentWorkspace = currentWorkspace;
  next();
}
