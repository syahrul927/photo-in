import { NextApiRequest, NextApiResponse } from "next";
import { getOAuthAuth } from "@/lib/google-oauth";
import { google } from "googleapis";
import { env } from "@/env";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { fileName, fileSize, mimeType } = req.body;

    // Validate input
    if (!fileName || !fileSize || !mimeType) {
      return res.status(400).json({ 
        error: "Missing required fields: fileName, fileSize, mimeType" 
      });
    }

    console.log("Creating upload token for:", { fileName, fileSize, mimeType });

    // Get OAuth authentication
    const auth = getOAuthAuth();
    const drive = google.drive({ version: "v3", auth });

    // Create resumable upload session using direct HTTP request
    const accessToken = await auth.getAccessToken();
    
    // Step 1: Initiate resumable upload session
    const initResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Type': mimeType,
        'X-Upload-Content-Length': fileSize.toString(),
      },
      body: JSON.stringify({
        name: fileName,
        parents: [env.GOOGLE_DRIVE_FOLDER],
      }),
    });

    if (!initResponse.ok) {
      const errorText = await initResponse.text();
      throw new Error(`Failed to initiate upload session: ${initResponse.status} - ${errorText}`);
    }

    // Get the upload URL from the Location header
    const uploadUrl = initResponse.headers.get('Location');
    
    if (!uploadUrl) {
      throw new Error("Failed to get upload URL from Google Drive");
    }

    // Access token already obtained above

    console.log("Upload token generated successfully");
    console.log("Upload URL:", uploadUrl);

    return res.status(200).json({
      success: true,
      uploadUrl: uploadUrl,
      accessToken: accessToken.token,
      expiresIn: 3600, // 1 hour
      folderId: env.GOOGLE_DRIVE_FOLDER,
      instructions: {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${accessToken.token}`,
          "Content-Type": mimeType,
          "Content-Length": fileSize.toString(),
        },
        note: "Use the uploadUrl with PUT method to upload your file directly to Google Drive"
      }
    });

  } catch (error) {
    console.error("Error generating upload token:", error);
    return res.status(500).json({ 
      error: "Failed to generate upload token",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}