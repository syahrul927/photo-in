import { getOAuth2Client } from "@/lib/google-service-account";
import { google } from "googleapis";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const { fileId } = await params;
  try {
    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 },
      );
    }

    const oauth2Client = await getOAuth2Client();

    const drive = google.drive({ version: "v3", auth: oauth2Client });

    const fileResponse = await drive.files.get(
      {
        fileId: fileId,
        alt: "media",
      },
      {
        responseType: "stream",
      },
    );

    const headers = fileResponse.headers as Record<string, string>;
    const contentType = headers["content-type"] || "image/jpeg";

    return new Response(fileResponse.data as unknown as ReadableStream, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=31536000",
        ETag: `"${fileId}"`,
      },
    });
  } catch (error) {
    console.error("Image proxy error:", error);

    const typedError = error as { response?: { status: number } };

    if (typedError.response?.status === 404) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    if (typedError.response?.status === 403) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
