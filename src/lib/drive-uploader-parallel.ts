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

// Optimized upload function that takes a pre-existing folder ID
export async function uploadFileToFolder(
  file: Express.Multer.File,
  folderId: string,
  oidcToken?: string,
): Promise<GoogleDriveFile | null> {
  try {
    // Use OAuth authentication (oidcToken parameter kept for backward compatibility)
    const auth = getOAuthAuth();
    const drive = google.drive({ version: "v3", auth });

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
          role: "reader",
          type: "anyone",
        },
      });
    }

    return response.data as GoogleDriveFile;
  } catch (error) {
    console.error("🚨 Failed to upload file to Drive:", error);
    console.error("detail: ", JSON.stringify(error));
    return null;
  }
}

// Keep the original function for backward compatibility
export async function uploadFile(
  file: Express.Multer.File,
  parentFolder: string,
  oidcToken?: string,
): Promise<GoogleDriveFile | null> {
  try {
    // Use OAuth authentication (oidcToken parameter kept for backward compatibility)
    const auth = getOAuthAuth();
    const folderId = await getOrCreateFolder(auth, parentFolder);
    return await uploadFileToFolder(file, folderId, oidcToken);
  } catch (error) {
    console.error("🚨 Failed to upload file to Drive:", error);
    return null;
  }
}

// Parallel upload function for multiple files
export async function uploadFilesParallel(
  files: Express.Multer.File[],
  eventId: string,
  onProgress?: (completed: number, total: number) => void,
  maxConcurrency = 3,
  oidcToken?: string,
): Promise<(GoogleDriveFile | null)[]> {
  try {
    // Use OAuth authentication (oidcToken parameter kept for backward compatibility)
    const auth = getOAuthAuth();
    const folderId = await getOrCreateFolder(auth, eventId);

    let completed = 0;
    const results: (GoogleDriveFile | null)[] = [];

    // Process files in batches to control concurrency
    for (let i = 0; i < files.length; i += maxConcurrency) {
      const batch = files.slice(i, i + maxConcurrency);

      const batchPromises = batch.map(async (file) => {
        const result = await uploadFileToFolder(file, folderId, oidcToken);
        completed++;
        onProgress?.(completed, files.length);
        return result;
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  } catch (error) {
    console.error("🚨 Failed to upload files in parallel:", error);
    return files.map(() => null);
  }
}
