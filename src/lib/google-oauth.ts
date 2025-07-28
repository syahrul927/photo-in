/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { env } from "@/env";
import { google } from "googleapis";

/**
 * Creates and returns an authenticated Google OAuth2 client
 * This replaces the complex Vercel OIDC + Service Account impersonation setup
 */
export function getOAuthAuth() {
  try {
    // Create OAuth2 client with credentials from environment
    const oauth2Client = new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      'urn:ietf:wg:oauth:2.0:oob' // For server-side applications
    );

    // Set the refresh token to automatically handle token refresh
    oauth2Client.setCredentials({
      refresh_token: env.GOOGLE_REFRESH_TOKEN,
    });

    // Set the required scopes for Google Drive operations
    oauth2Client.scopes = [
      "https://www.googleapis.com/auth/drive.file", // For creating & modifying files
      "https://www.googleapis.com/auth/drive.readonly", // For reading files
      "https://www.googleapis.com/auth/drive", // For managing permissions
    ];

    return oauth2Client;
  } catch (error) {
    console.error("Failed to create OAuth2 client:", error);
    throw new Error(
      "OAuth authentication failed. Please ensure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN are properly configured."
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
      fields: 'user'
    });
    
    console.log("OAuth connection successful. Authenticated as:", response.data.user?.emailAddress);
    return true;
  } catch (error) {
    console.error("OAuth connection test failed:", error);
    return false;
  }
}