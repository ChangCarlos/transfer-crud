import dotenv from 'dotenv';
dotenv.config();

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://wallet:wallet@localhost:5432/walletdb?schema=public';
}

if (!process.env.REDIS_URL) {
  process.env.REDIS_URL = 'redis://localhost:6379';
}

process.env.NODE_ENV = 'test';
