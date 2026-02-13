import { prisma } from "../../shared/database/prisma";

export const walletRepository = {
    create: async (ownerId: string) => {
        return await prisma.wallet.create({
            data: {
                ownerId,
            }
        })
    },

    findById: async (id: string) => {
        return await prisma.wallet.findUnique({
            where: { id },
        })
    }
}