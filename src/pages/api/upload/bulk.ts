/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unused-vars */
import { uploadFile } from "@/lib/drive-uploader";
import {
  AuthPagesRequest,
  requireAuthWithWorkspace,
} from "@/server/middlewares/auth-pages-api";
import { db } from "@/server/db";
import { photo } from "@/server/db/schemas";
import multer from "multer";
import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";

// Disable default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

type NextApiRequestWithFile = NextApiRequest & {
  body: {
    eventId: string;
  };
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

const apiRoute = createRouter<NextApiRequestWithFile, NextApiResponse>();

apiRoute.use(uploadMiddleware); // This applies the multer middleware
apiRoute.use(requireAuthWithWorkspace);
apiRoute.post(async (req: NextApiRequest, res: NextApiResponse) => {
  const { session, currentWorkspace } = req as AuthPagesRequest;
  const file = (req as any).file as Express.Multer.File;

  if (!file) {
    return res.status(400).json({ error: "No files uploaded." });
  }
  const eventId = req.body.eventId as string;

  // Extract OIDC token from request headers
  const oidcToken = req.headers['x-vercel-oidc-token'] as string;
  
  // Upload file to Google Drive
  const uploaded = await uploadFile(file, eventId, oidcToken);

  if (!uploaded) {
    return res.status(500).json({ error: "Upload failed." });
  }

  try {
    // Save photo metadata to database
    const photoMetadata = {
      eventId: eventId,
      cloudId: uploaded.id,
      title: uploaded.name,
      metaData: JSON.stringify({
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      }),
      description: null,
      url: `https://drive.google.com/uc?export=view&id=${uploaded.id}`,
      uploadedBy: session.user.id,
    };

    await db.insert(photo).values(photoMetadata);

    return res.status(200).json({
      message: "Upload complete.",
      file: uploaded,
      photoId: photoMetadata.cloudId,
    });
  } catch (dbError) {
    console.error("Failed to save photo metadata to database:", dbError);
    // File was uploaded successfully to Drive, but DB save failed
    return res.status(200).json({
      message: "Upload complete, but failed to save metadata.",
      file: uploaded,
      warning: "Photo metadata not saved to database",
    });
  }
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
