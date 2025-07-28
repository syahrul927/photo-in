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

export async function uploadFile(
  file: Express.Multer.File,
  parentFolder: string,
  oidcToken?: string,
): Promise<GoogleDriveFile | null> {
  try {
    // Use OAuth authentication (oidcToken parameter kept for backward compatibility)
    const auth = getOAuthAuth();
    const drive = google.drive({ version: "v3", auth });

    // Get or create the folder
    const folderId = await getOrCreateFolder(auth, parentFolder);

    const bufferStream = Readable.from(file.buffer);
    const response = await drive.files.create({
      media: {
        mimeType: file.mimetype,
        body: bufferStream,
      },
      requestBody: {
        name: file.originalname,
        parents: [folderId],
      },
      fields: "id, name",
    });

    // Make the file publicly accessible
    if (response.data.id) {
      await drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
    }

    return response.data as GoogleDriveFile;
  } catch (error) {
    console.error("Failed to upload file to Drive:", error);
    if (error instanceof Error && error.message.includes('x-vercel-oidc-token')) {
      console.error("OIDC Token Error: Make sure OIDC is enabled in Vercel project settings");
    }
    return null;
  }
}
