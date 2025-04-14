/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unused-vars */
import { env } from "@/env";
import { getVercelOidcToken } from "@vercel/functions/oidc";
import {
  type BaseExternalAccountClient,
  ExternalAccountClient,
} from "google-auth-library";
import { google } from "googleapis";
import multer from "multer";
import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import { Readable } from "stream";

const UPLOAD_FOLDER_ID = env.GOOGLE_DRIVE_FOLDER;

// Disable default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

type NextApiRequestWithFile = NextApiRequest & {
  file: Express.Multer.File;
};
function multerMiddleware(middleware: any) {
  return (
    req: NextApiRequestWithFile,
    res: NextApiResponse,
    next: (err?: any) => void,
  ) => {
    middleware(req as any, res as any, next);
  };
}
// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const uploadMiddleware = multerMiddleware(upload.single("images"));

interface GoogleDriveFile {
  id: string;
  name: string;
}

function getServiceAccountAuth() {
  const authClient = ExternalAccountClient.fromJSON({
    type: "external_account",
    audience: `//iam.googleapis.com/projects/${env.GCP_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${env.GCP_WORKLOAD_IDENTITY_POOL_ID}/providers/${env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID}`,
    subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
    token_url: "https://sts.googleapis.com/v1/token",
    service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${env.GCP_SERVICE_ACCOUNT_EMAIL}:generateAccessToken`,
    subject_token_supplier: {
      getSubjectToken: getVercelOidcToken,
    },
  });

  if (!authClient) throw new Error("Failed Create Credentials");
  return authClient;
}

async function uploadFileToDrive(
  auth: BaseExternalAccountClient,
  file: Express.Multer.File,
  folderId: string,
): Promise<GoogleDriveFile | null> {
  try {
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

    return response.data as GoogleDriveFile;
  } catch (_error) {
    return null;
  }
}

const apiRoute = createRouter<NextApiRequestWithFile, NextApiResponse>();
// API Route Handler using next-connect to handle middleware

apiRoute.use(uploadMiddleware); // This applies the multer middleware
apiRoute.post(async (req: NextApiRequest, res: NextApiResponse) => {
  if (!UPLOAD_FOLDER_ID) {
    return res
      .status(500)
      .json({ error: "Google Drive Folder ID not configured." });
  }

  const file = (req as any).file as Express.Multer.File;

  if (!file) {
    return res.status(400).json({ error: "No files uploaded." });
  }

  const auth = getServiceAccountAuth();
  const uploaded = await uploadFileToDrive(auth, file, UPLOAD_FOLDER_ID);

  if (!uploaded) {
    return res.status(500).json({ error: "Upload failed." });
  }

  return res.status(200).json({
    message: "Upload complete.",
    file: uploaded,
  });
});
export default apiRoute.handler({
  onError: (err, req, res) => {
    console.error("Error occurred:", err);
    res.status(500).json({ error: "Internal Server Error", details: err });
  },
  onNoMatch: (req, res) => {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});
