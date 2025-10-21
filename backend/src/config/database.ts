import dotenv from "dotenv";
import { PrismaClient } from "../generated/prisma";
import { logger } from "../utils/logger";

// Load environment variables first
dotenv.config();

// Database connection configuration
const createPrismaClient = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "production"
        ? ["error", "warn"]
        : ["query", "error", "info", "warn"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

// Create singleton instance
let prisma: PrismaClient;

declare global {
  var __prisma: PrismaClient | undefined;
}

if (process.env.NODE_ENV === "production") {
  prisma = createPrismaClient();
} else {
  if (!global.__prisma) {
    global.__prisma = createPrismaClient();
  }
  prisma = global.__prisma;
}

// Database logging is handled by Prisma's built-in logging

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info("Disconnecting from database...");
  await prisma.$disconnect();
  logger.info("Database disconnected");
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

export { prisma };
