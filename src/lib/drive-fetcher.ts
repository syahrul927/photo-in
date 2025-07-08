/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { env } from "@/env";
import { getVercelOidcToken } from "@vercel/functions/oidc";
import {
  type BaseExternalAccountClient,
  ExternalAccountClient,
} from "google-auth-library";
import { headers } from "next/headers";
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

function getServiceAccountAuth(oidcToken?: string) {
  try {
    const json = {
      universe_domain: "googleapis.com",
      type: "external_account",
      audience: `//iam.googleapis.com/projects/${env.GCP_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${env.GCP_WORKLOAD_IDENTITY_POOL_ID}/providers/${env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID}`,
      subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
      token_url: "https://sts.googleapis.com/v1/token",
      service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${env.GCP_SERVICE_ACCOUNT_EMAIL}:generateAccessToken`,

      subject_token_supplier: {
        getSubjectToken: async () => {
          // If token is provided directly, use it
          if (oidcToken) {
            return oidcToken;
          }
          
          // Production: get from headers (App Router only)
          if (process.env.NODE_ENV === 'production') {
            try {
              const headersList = await headers();
              const headerToken = headersList.get('x-vercel-oidc-token');
              if (headerToken) {
                return headerToken;
              }
            } catch (error) {
              // headers() not available in this context (e.g., Pages API)
              throw new Error('OIDC token not found. Please pass token directly to the function.');
            }
            throw new Error('OIDC token not found in production headers');
          }
          
          // Development: use SDK function
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
          return await getVercelOidcToken();
        },
      },
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
    const authClient = ExternalAccountClient.fromJSON(json as Parameters<typeof ExternalAccountClient.fromJSON>[0]) as ExternalAccountClient;

    if (!authClient) throw new Error("Failed Create Credentials");
    (authClient as any).scopes = [
      "https://www.googleapis.com/auth/drive.readonly", // For reading files
    ];
    return authClient;
  } catch (error) {
    console.error("OIDC Authentication failed:", error);
    throw new Error(
      "OIDC authentication failed. Please ensure OIDC is enabled in your Vercel project settings. " +
      "Go to Vercel Dashboard > Project Settings > General > Enable OIDC Token."
    );
  }
}

async function getFolderId(
  auth: BaseExternalAccountClient,
  folderName: string,
): Promise<string | null> {
  const drive = google.drive({ version: "v3", auth: auth as any });

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
    const auth = getServiceAccountAuth(oidcToken);
    const drive = google.drive({ version: "v3", auth: auth as any });

    // Get the folder ID for this event
    const folderId = await getFolderId(auth as any, eventId);
    
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