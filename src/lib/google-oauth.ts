 
import { env } from "@/env";
import { google } from "googleapis";

/**
 * Creates and returns an authenticated Google OAuth2 client
 * This replaces the complex Vercel OIDC + Service Account impersonation setup
 */
export function getOAuthAuth() {
  try {
    // Determine the redirect URI based on environment
    const getRedirectUri = () => {
      if (env.NODE_ENV === "development") {
        return "http://localhost:3000/api/oauth2callback";
      }

      // For production, use VERCEL_URL if available, otherwise fallback to a default
      const vercelUrl = process.env.VERCEL_URL;
      if (vercelUrl) {
        return `https://${vercelUrl}/api/oauth2callback`;
      }

      // Fallback - you might want to set this to your actual production domain
      throw new Error("VERCEL_URL not found in production environment");
    };

    // Create OAuth2 client with credentials from environment
    const oauth2Client = new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      getRedirectUri(),
    );

    // Set the refresh token to automatically handle token refresh
    oauth2Client.setCredentials({
      refresh_token: env.GOOGLE_REFRESH_TOKEN,
    });

    // Set the required scopes for Google Drive operations
    // oauth2Client.scopes = [
    //   "https://www.googleapis.com/auth/drive.file", // For creating & modifying files
    //   "https://www.googleapis.com/auth/drive.readonly", // For reading files
    //   "https://www.googleapis.com/auth/drive", // For managing permissions
    // ];

    return oauth2Client;
  } catch (error) {
    console.error("Failed to create OAuth2 client:", error);
    throw new Error(
      "OAuth authentication failed. Please ensure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN are properly configured.",
    );
  }
}

/**
 * Test function to verify OAuth authentication is working
 * Can be used during development/testing
 */
export async function testOAuthConnection() {
  try {
    const auth = getOAuthAuth();
    const drive = google.drive({ version: "v3", auth });

    // Simple test: get user info about the authenticated account
    const response = await drive.about.get({
      fields: "user",
    });

    console.log(
      "OAuth connection successful. Authenticated as:",
      response.data.user?.emailAddress,
    );
    return true;
  } catch (error) {
    console.error("OAuth connection test failed:", error);
    return false;
  }
}
