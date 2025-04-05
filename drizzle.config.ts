import { type Config } from "drizzle-kit";

import { env } from "@/env";

const dbCredentials: { url: string; authToken?: string } = {
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN,
};

export default {
  out: "./src/server/db/migrations/",
  schema: [
    "./src/server/db/schemas/schema.ts",
    "./src/server/db/schemas/relations.ts",
  ],
  dialect: "turso",
  dbCredentials,
  verbose: true,
  breakpoints: true,
} satisfies Config;
