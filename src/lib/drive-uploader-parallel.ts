/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { env } from "@/env";
import { getVercelOidcToken } from "@vercel/functions/oidc";
import {
  type BaseExternalAccountClient,
  ExternalAccountClient,
} from "google-auth-library";
import { headers } from "next/headers";
import { google } from "googleapis";
import { Readable } from "stream";

const UPLOAD_FOLDER_ID = env.GOOGLE_DRIVE_FOLDER;

interface GoogleDriveFile {
  id: string;
  name: string;
}

function getServiceAccountAuth(oidcToken?: string) {
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
    "https://www.googleapis.com/auth/drive.file", // For creating & modifying files
    "https://www.googleapis.com/auth/drive.readonly", // For reading files
    "https://www.googleapis.com/auth/drive", // For managing permissions
  ];
  return authClient;
}

async function getOrCreateFolder(
  auth: BaseExternalAccountClient,
  folderName: string,
): Promise<string> {
  const start = Date.now();
  const drive = google.drive({ version: "v3", auth: auth as any });

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
export async function createEventFolder(eventId: string, oidcToken?: string): Promise<string | null> {
  try {
    const auth = getServiceAccountAuth(oidcToken);
    return await getOrCreateFolder(auth as any, eventId);
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
    const auth = getServiceAccountAuth(oidcToken);
    const drive = google.drive({ version: "v3", auth: auth as any });

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
    console.error("🚨 Failed to upload file to Drive:", error);
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
    const auth = getServiceAccountAuth(oidcToken);
    const folderId = await getOrCreateFolder(auth as any, parentFolder);
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
  oidcToken?: string
): Promise<(GoogleDriveFile | null)[]> {
  try {
    const auth = getServiceAccountAuth(oidcToken);
    const folderId = await getOrCreateFolder(auth as any, eventId);
    
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