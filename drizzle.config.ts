import { type Config } from "drizzle-kit";

import { env } from "@/env";

const dbCredentials: { url: string; authToken?: string } = {
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN,
};

export default {
  schema: [
    "./src/server/db/schemas/schema.ts",
    "./src/server/db/schemas/relations.ts",
  ],
  out: "./drizzle/migrations/",
  dialect: "sqlite",
  dbCredentials,
  driver: "turso",
  verbose: true,
} satisfies Config;
