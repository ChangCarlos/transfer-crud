import { prisma } from "../../shared/database/prisma";
import { BaseError } from "../../shared/errors/base.error";
import { walletRepository } from "./wallet.repository";


export const walletService = {

    async create(ownerId: string) {
        return walletRepository.create(ownerId);
    },

    async getBalance(walletId: string) {
        const wallet = await walletRepository.findById(walletId);

        if (!wallet) {
            throw new BaseError("Wallet not found", 404);
        }

        const result = await prisma.ledgerEntry.aggregate({
            _sum: { 
                amount: true,
            },
            where: {
                walletId,
            }
        })

        return Number(result._sum.amount || 0);
    }
}