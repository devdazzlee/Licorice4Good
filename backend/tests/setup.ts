import { PrismaClient } from "@prisma/client";

// Mock environment variables for testing
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-key-for-testing-only";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/nathan_test";
process.env.CLIENT_URL = "http://localhost:3000";

// Create comprehensive mock functions with proper Jest typing
const createMockPrismaModel = () => ({
  findUnique: jest.fn(),
  findMany: jest.fn(),
  findFirst: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  deleteMany: jest.fn(),
  count: jest.fn(),
  upsert: jest.fn(),
  aggregate: jest.fn(),
  groupBy: jest.fn(),
});

// Mock the PrismaClient constructor
jest.mock("../src/generated/prisma", () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: createMockPrismaModel(),
    product: createMockPrismaModel(),
    order: createMockPrismaModel(),
    cartItem: createMockPrismaModel(),
    flavor: createMockPrismaModel(),
    orderItem: createMockPrismaModel(),
    cartLine: createMockPrismaModel(),
    packRecipe: createMockPrismaModel(),
    packRecipeItem: createMockPrismaModel(),
    flavorInventory: createMockPrismaModel(),
    productFlavor: createMockPrismaModel(),
    $transaction: jest.fn(),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  })),
}));

// Also mock the database config file
jest.mock("../src/config/database", () => ({
  prisma: {
    user: createMockPrismaModel(),
    product: createMockPrismaModel(),
    order: createMockPrismaModel(),
    cartItem: createMockPrismaModel(),
    flavor: createMockPrismaModel(),
    orderItem: createMockPrismaModel(),
    cartLine: createMockPrismaModel(),
    packRecipe: createMockPrismaModel(),
    packRecipeItem: createMockPrismaModel(),
    flavorInventory: createMockPrismaModel(),
    productFlavor: createMockPrismaModel(),
    $transaction: jest.fn(),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  },
}));

// Mock logger to prevent console output during tests
jest.mock("../src/utils/logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock mailer
jest.mock("../src/utils/mailer", () => ({
  sendResetEmail: jest.fn(),
  sendVerificationEmail: jest.fn(),
}));

// Global test setup
beforeEach(() => {
  jest.clearAllMocks();
});

// Mock bcrypt for consistent testing
jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

export {};
