import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting database seed...\n');
  
  // Note: ownerId must be UNIQUE (one wallet per user)
  // In production, this would be a UUID from your users/auth table
  // Using descriptive IDs here for easier testing

  const wallet1 = await prisma.wallet.create({
    data: {
      ownerId: 'user-alice-001',
      ledgerEntries: {
        create: [
          {
            transactionId: 'initial-deposit-alice',
            amount: 1000,
          },
        ],
      },
    },
  });
  console.log('Created wallet for user-alice-001 with $1000');

  const wallet2 = await prisma.wallet.create({
    data: {
      ownerId: 'user-bob-002',
      ledgerEntries: {
        create: [
          {
            transactionId: 'initial-deposit-bob',
            amount: 500,
          },
        ],
      },
    },
  });
  console.log('Created wallet for user-bob-002 with $500');

  const wallet3 = await prisma.wallet.create({
    data: {
      ownerId: 'user-charlie-003',
      ledgerEntries: {
        create: [
          {
            transactionId: 'initial-deposit-charlie',
            amount: 250,
          },
        ],
      },
    },
  });
  console.log('Created wallet for user-charlie-003 with $250');

  const wallet4 = await prisma.wallet.create({
    data: {
      ownerId: 'user-dave-004',
      ledgerEntries: {
        create: [
          {
            transactionId: 'initial-deposit-dave',
            amount: 0,
          },
        ],
      },
    },
  });
  console.log('Created wallet for user-dave-004 with $0');

  console.log('\nSeed Summary:');
  console.log(`   • user-alice-001   → Wallet ID: ${wallet1.id} → Balance: $1000`);
  console.log(`   • user-bob-002     → Wallet ID: ${wallet2.id} → Balance: $500`);
  console.log(`   • user-charlie-003 → Wallet ID: ${wallet3.id} → Balance: $250`);
  console.log(`   • user-dave-004    → Wallet ID: ${wallet4.id} → Balance: $0`);
  console.log('\nSeed completed successfully!');
  console.log('\nYou can now test transfers using these wallet IDs.');
  console.log('   Example: Transfer $100 from user-alice-001 to user-bob-002\n');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
