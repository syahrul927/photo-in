/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { env } from "@/env";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import { getOAuth2Client } from "./google-service-account";

const UPLOAD_FOLDER_ID = env.GOOGLE_DRIVE_FOLDER;

async function getOrCreateFolder(
  auth: OAuth2Client,
  folderName: string,
): Promise<string> {
  const start = Date.now();
  const drive = google.drive({ version: "v3", auth });

  const response = await drive.files.list({
    q: `'${UPLOAD_FOLDER_ID}' in parents and mimeType = 'application/vnd.google-apps.folder' and name = '${folderName}' and trashed = false`,
    fields: "files(id, name)",
    spaces: "drive",
  });

  const folder = response.data.files?.[0];
  if (folder) return folder.id!;

  const newFolder = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [UPLOAD_FOLDER_ID],
    },
    fields: "id",
  });

  const end = Date.now();
  console.log(`Check Folder took ${end - start}ms`);
  return newFolder.data.id!;
}

// New function to create folder during event creation
export async function createEventFolder(
  eventId: string,
): Promise<string | null> {
  try {
    // Use OAuth authentication (oidcToken parameter kept for backward compatibility)
    const auth = await getOAuth2Client();
    return await getOrCreateFolder(auth, eventId);
  } catch (error) {
    console.error("🚨 Failed to create event folder:", error);
    return null;
  }
}
