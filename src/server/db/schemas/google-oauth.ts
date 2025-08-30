import { sqliteTable, text, numeric, integer } from "drizzle-orm/sqlite-core";

// Separate table for Google OAuth application-level credentials
// This stores global OAuth credentials for the PhotoIn app, not user login
export const googleOAuthCredentials = sqliteTable("google_oauth_credentials", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  // Application-level identifiers
  provider: text("provider").notNull().default("google"),

  // OAuth tokens and metadata
  accessToken: text("access_token"),
  refreshToken: text("refresh_token").notNull(),

  // Token metadata
  tokenType: text("token_type").default("Bearer"),
  scope: text("scope"),
  expiresAt: numeric("expires_at"),

  // Configuration details
  clientId: text("client_id"), // Optional: for debugging different credentials
  lastRefreshAt: numeric("last_refresh_at").default(sql`(CURRENT_TIMESTAMP)`),

  // When this entry was created/updated
  createdAt: numeric("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: numeric("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

// For multiple credential types (e.g., dev/staging/prod)
export type GoogleOAuthCredentials = typeof googleOAuthCredentials.$inferSelect;
export type NewGoogleOAuthCredentials =
  typeof googleOAuthCredentials.$inferInsert;

// Import sql for default functions
import { sql } from "drizzle-orm";
