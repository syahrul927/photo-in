/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unused-vars */
import { uploadFilesParallel } from "@/lib/drive-uploader-parallel";
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

type NextApiRequestWithFiles = NextApiRequest & {
  body: {
    eventId: string;
  };
  files: Express.Multer.File[];
};

function multerMiddleware(middleware: any) {
  return (
    req: NextApiRequestWithFiles,
    res: NextApiResponse,
    next: (err?: any) => void,
  ) => {
    middleware(req as any, res as any, next);
  };
}

// Multer setup for multiple files
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const uploadMiddleware = multerMiddleware(upload.array("images", 50)); // Allow up to 50 files

const apiRoute = createRouter<NextApiRequestWithFiles, NextApiResponse>();

apiRoute.use(uploadMiddleware);
apiRoute.use(requireAuthWithWorkspace);

apiRoute.post(async (req: NextApiRequest, res: NextApiResponse) => {
  const { session, currentWorkspace } = req as AuthPagesRequest;
  const files = (req as any).files as Express.Multer.File[];

  if (!files || files.length === 0) {
    return res.status(400).json({ error: "No files uploaded." });
  }

  const eventId = req.body.eventId as string;
  if (!eventId) {
    return res.status(400).json({ error: "Event ID is required." });
  }

  try {
    // Upload files in parallel with progress tracking using OAuth
    let uploadedCount = 0;
    const uploadResults = await uploadFilesParallel(
      files,
      eventId,
      (completed, total) => {
        uploadedCount = completed;
        console.log(`Upload progress: ${completed}/${total}`);
      },
      3 // Max 3 concurrent uploads to avoid rate limits
    );

    // Prepare photo metadata for batch insert
    const photoMetadataArray = [];
    const successfulUploads = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const uploaded = uploadResults[i];

      if (uploaded && file) {
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
          url: `secure://${uploaded.id}`,
          uploadedBy: session.user.id,
        };

        photoMetadataArray.push(photoMetadata);
        successfulUploads.push(uploaded);
      }
    }

    // Batch insert photo metadata to database
    if (photoMetadataArray.length > 0) {
      await db.insert(photo).values(photoMetadataArray);
    }

    const failedCount = files.length - successfulUploads.length;

    return res.status(200).json({
      message: `Upload complete. ${successfulUploads.length} files uploaded successfully.`,
      uploaded: successfulUploads,
      totalFiles: files.length,
      successfulUploads: successfulUploads.length,
      failedUploads: failedCount,
      ...(failedCount > 0 && { 
        warning: `${failedCount} files failed to upload` 
      })
    });

  } catch (error) {
    console.error("Parallel upload error:", error);
    return res.status(500).json({ 
      error: "Upload failed", 
      details: error instanceof Error ? error.message : "Unknown error" 
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