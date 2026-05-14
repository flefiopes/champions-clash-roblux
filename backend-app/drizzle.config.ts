/**
 * Drizzle Kit configuration for MySQL database migrations.
 * Uses environment variables for database connection settings.
 *
 * @module drizzle.config
 */
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "mysql",
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    host: process.env.DATABASE_HOST || "localhost",
    port: Number(process.env.DATABASE_PORT) || 3306,
    user: process.env.DATABASE_USER || "root",
    password: process.env.DATABASE_PASSWORD || "basicpassword",
    database: process.env.DATABASE_NAME || "template_db",
  },
  verbose: true,
  strict: true,
});
