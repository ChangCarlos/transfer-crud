import { prisma } from '../src/shared/database/prisma';
import { redis } from '../src/shared/cache/redis';

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  
  await prisma.$executeRaw`TRUNCATE TABLE "LedgerEntry", "Wallet" RESTART IDENTITY CASCADE`;
  await redis.flushall();
});

beforeEach(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE "LedgerEntry", "Wallet" RESTART IDENTITY CASCADE`;
  
  await redis.flushall();
  
  await new Promise(resolve => setTimeout(resolve, 50));
});

afterAll(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE "LedgerEntry", "Wallet" RESTART IDENTITY CASCADE`;
  
  await redis.quit();
  await prisma.$disconnect();
  
  await new Promise(resolve => setTimeout(resolve, 100));
});
