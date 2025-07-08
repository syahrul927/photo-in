import { env } from "@/env";
import { getVercelOidcToken } from "@vercel/functions/oidc";
import {
  BaseExternalAccountClient,
  ExternalAccountClient,
} from "google-auth-library";
import { google } from "googleapis";

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

function getServiceAccountAuth() {
  const json = {
    universe_domain: "googleapis.com",
    type: "external_account",
    audience: `//iam.googleapis.com/projects/${env.GCP_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${env.GCP_WORKLOAD_IDENTITY_POOL_ID}/providers/${env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID}`,
    subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
    token_url: "https://sts.googleapis.com/v1/token",
    service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${env.GCP_SERVICE_ACCOUNT_EMAIL}:generateAccessToken`,

    subject_token_supplier: {
      getSubjectToken: getVercelOidcToken,
    },
  };
  const authClient = ExternalAccountClient.fromJSON(json);

  if (!authClient) throw new Error("Failed Create Credentials");
  authClient.scopes = [
    "https://www.googleapis.com/auth/drive.readonly", // For reading files
  ];
  return authClient;
}

async function getFolderId(
  auth: BaseExternalAccountClient,
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
): Promise<GoogleDriveImage[]> {
  try {
    const auth = getServiceAccountAuth();
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
    return [];
  }
}

// Note: Image buffer functions removed - now using direct Google Drive URLs