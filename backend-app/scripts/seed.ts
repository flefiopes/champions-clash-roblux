/**
 * Database Seeding Script.
 * Inserts default admin and test users into the database.
 * Run via: bun run db:seed
 *
 * @module scripts/seed
 */

import { initDatabase, closeDatabase, getDatabase } from "@/db";
import { users } from "@/db/schema/users";
import { encryptEmail, computeBlindIndex } from "@/services/auth/email-crypto.service";
import { hashPassword } from "@/services/auth/password.service";
import { randomUUID } from "node:crypto";
import { getLogger } from "@/lib/logger";

const logger = getLogger();

async function seed() {
  logger.info("Starting database seeding process...");

  initDatabase();
  // Initialize DB connection
  const db = getDatabase();

  const seeds = [
    {
      email: "admin@template.local",
      username: "admin",
      password: "password123!",
      role: "admin" as const,
      isVerifiedEmail: true,
    },
    {
      email: "test@template.local",
      username: "tester",
      password: "password123!",
      role: "user" as const,
      isVerifiedEmail: true,
    },
  ];

  try {
    for (const user of seeds) {
      logger.info({ email: user.email }, "Seeding user");

      const encryptedEmail = encryptEmail(user.email);
      const emailBlindIndex = computeBlindIndex(user.email);
      const hashedPassword = await hashPassword(user.password);

      try {
        await db.insert(users).values({
          id: randomUUID(),
          emailEncrypted: encryptedEmail,
          emailBlindIndex: emailBlindIndex,
          passwordHash: hashedPassword,
          username: user.username,
          role: user.role,
          isVerifiedEmail: user.isVerifiedEmail,
          accountStatus: "active",
        });

        logger.info({ email: user.email }, "User successfully created");
      } catch (insertError: any) {
        // Handle duplicate entry gracefully (MySQL ER_DUP_ENTRY is usually 1062)
        if (insertError.code === "ER_DUP_ENTRY") {
          logger.warn({ email: user.email }, "User already exists - skipping");
        } else {
          throw insertError;
        }
      }
    }

    logger.info("Database seeding completed successfully");
  } catch (error) {
    logger.error({ error }, "Error during database seeding");
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

seed();
