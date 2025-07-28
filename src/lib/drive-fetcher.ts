/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { env } from "@/env";
import { google } from "googleapis";
import { getOAuthAuth } from "./google-oauth";

const UPLOAD_FOLDER_ID = env.GOOGLE_DRIVE_FOLDER;

interface GoogleDriveImage {
  id: string;
  name: string;
  webViewLink: string;
  webContentLink: string;
  thumbnailLink?: string;
  createdTime: string;
  modifiedTime: string;
  size: string;
}


async function getFolderId(
  auth: any,
  folderName: string,
): Promise<string | null> {
  const drive = google.drive({ version: "v3", auth });

  const response = await drive.files.list({
    q: `'${UPLOAD_FOLDER_ID}' in parents and mimeType = 'application/vnd.google-apps.folder' and name = '${folderName}' and trashed = false`,
    fields: "files(id, name)",
    spaces: "drive",
  });

  const folder = response.data.files?.[0];
  return folder?.id || null;
}

export async function getImagesFromFolder(
  eventId: string,
  oidcToken?: string,
): Promise<GoogleDriveImage[]> {
  try {
    // Use OAuth authentication (oidcToken parameter kept for backward compatibility)
    const auth = getOAuthAuth();
    const drive = google.drive({ version: "v3", auth });

    // Get the folder ID for this event
    const folderId = await getFolderId(auth, eventId);
    
    if (!folderId) {
      console.log(`No folder found for event: ${eventId}`);
      return [];
    }

    // List all image files in the folder
    const response = await drive.files.list({
      q: `'${folderId}' in parents and (mimeType contains 'image/') and trashed = false`,
      fields: "files(id, name, webViewLink, webContentLink, thumbnailLink, createdTime, modifiedTime, size)",
      orderBy: "createdTime desc",
      pageSize: 1000, // Adjust as needed
    });

    const files = response.data.files || [];
    
    return files.map((file) => ({
      id: file.id || '',
      name: file.name || 'Unknown',
      webViewLink: file.webViewLink || '',
      webContentLink: file.webContentLink || '',
      thumbnailLink: file.thumbnailLink || undefined,
      createdTime: file.createdTime || '',
      modifiedTime: file.modifiedTime || '',
      size: file.size || '0',
    }));
  } catch (error) {
    console.error("Failed to fetch images from Drive:", error);
    if (error instanceof Error && error.message.includes('x-vercel-oidc-token')) {
      console.error("OIDC Token Error: Make sure OIDC is enabled in Vercel project settings");
    }
    return [];
  }
}

// Note: Image buffer functions removed - now using direct Google Drive URLs