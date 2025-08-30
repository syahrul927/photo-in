import { env } from "@/env";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";

const GOOGLE_SERVICE_ACCOUNT_KEY_BASE64 = env.GOOGLE_SERVICE_ACCOUNT_KEY;

if (!GOOGLE_SERVICE_ACCOUNT_KEY_BASE64) {
  throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_KEY environment variable");
}

interface ServiceAccountKey {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain: string;
}

let serviceAccountKey: ServiceAccountKey;

try {
  const decodedKey = Buffer.from(
    GOOGLE_SERVICE_ACCOUNT_KEY_BASE64,
    "base64",
  ).toString("utf-8");
  serviceAccountKey = JSON.parse(decodedKey) as ServiceAccountKey;
} catch (error) {
  throw new Error("Invalid GOOGLE_SERVICE_ACCOUNT_KEY base64 format");
}

// Service account auth configuration
const auth = new google.auth.GoogleAuth({
  credentials: serviceAccountKey,
  scopes: [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/drive",
  ],
});

/**
 * Returns OAuth2Client configured for service account (for your own Google Drive utility)
 */
export async function getOAuth2Client(): Promise<OAuth2Client> {
  const client = await auth.getClient();
  return client as OAuth2Client;
}

/**
 * Returns access token for Google Drive Picker (frontend usage)
 */
export async function getAccessToken(): Promise<string> {
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  return tokenResponse.token as string;
}
