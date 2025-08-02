/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { env } from "@/env";
import { google } from "googleapis";
import { Readable } from "stream";
import { getOAuthAuth } from "./google-oauth";

const UPLOAD_FOLDER_ID = env.GOOGLE_DRIVE_FOLDER;

interface GoogleDriveFile {
  id: string;
  name: string;
}

async function getOrCreateFolder(
  auth: any,
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
  oidcToken?: string,
): Promise<string | null> {
  try {
    // Use OAuth authentication (oidcToken parameter kept for backward compatibility)
    const auth = getOAuthAuth();
    return await getOrCreateFolder(auth, eventId);
  } catch (error) {
    console.error("🚨 Failed to create event folder:", error);
    return null;
  }
}
