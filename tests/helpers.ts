import { prisma } from '../src/shared/database/prisma';

export async function createWalletWithBalance(ownerId: string, initialBalance: number) {

  const wallet = await prisma.wallet.create({
    data: {
      ownerId,
      ledgerEntries: initialBalance > 0 ? {
        create: {
          transactionId: `initial-${ownerId}-${Date.now()}`,
          amount: initialBalance,
        }
      } : undefined,
    },
  });

  return wallet;
}

export async function getWalletBalance(walletId: string): Promise<number> {
  const result = await prisma.ledgerEntry.aggregate({
    _sum: { amount: true },
    where: { walletId },
  });

  return Number(result._sum.amount || 0);
}

export async function getWalletLedger(walletId: string) {
  return await prisma.ledgerEntry.findMany({
    where: { walletId },
    orderBy: { createdAt: 'asc' },
  });
}
