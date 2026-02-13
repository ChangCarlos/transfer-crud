import { prisma } from "../../shared/database/prisma";
import { redis } from "../../shared/cache/redis";
import { BaseError } from "../../shared/errors/base.error";
import { randomUUID } from "crypto";

interface TransferData {
    fromWalletId: string;
    toWalletId: string;
    amount: number;
}

export const transferService = {

    async execute(data: TransferData, idempotencyKey: string) {
        const { fromWalletId, toWalletId, amount } = data;

        const cachedResult = await redis.get(idempotencyKey);
        if (cachedResult) return JSON.parse(cachedResult);

        const result = await prisma.$transaction(async (tx) => {
            const walletIds = [fromWalletId, toWalletId].sort();
            
            const wallets = await tx.wallet.findMany({
                where: {
                    id: { in: walletIds }
                }
            });

            const fromWallet = wallets.find(w => w.id === fromWalletId);
            const toWallet = wallets.find(w => w.id === toWalletId);

            if (!fromWallet || !toWallet) {
                throw new BaseError("Wallet not found", 404);
            }

            const balance = await tx.ledgerEntry.aggregate({
                _sum: { 
                    amount: true,
                },
                where: {
                    walletId: fromWalletId,
                }
            });

            if (Number(balance._sum.amount || 0) < amount) {
                throw new BaseError("Insufficient funds", 409);
            }

            const transactionId = randomUUID();

            await tx.ledgerEntry.create({
                data: {
                    walletId: fromWalletId,
                    amount: -amount,
                    transactionId,
                }
            });

            await tx.ledgerEntry.create({
                data: {
                    walletId: toWalletId,
                    amount: amount,
                    transactionId,
                }
            });

            await tx.wallet.update({
                where: {
                    id_version: {
                        id: fromWalletId,
                        version: fromWallet.version,
                    }
                },
                data: {
                    version: { increment: 1 }
                }
            });

            if (fromWalletId !== toWalletId) {
                await tx.wallet.update({
                    where: {
                        id_version: {
                            id: toWalletId,
                            version: toWallet.version,
                        }
                    },
                    data: {
                        version: { increment: 1 }
                    }
                });
            }

            return { success: true, transactionId };
        });

        await redis.set(idempotencyKey, JSON.stringify(result), "EX", 86400); // 24 hours

        return result;
    }
}