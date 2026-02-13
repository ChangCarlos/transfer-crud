import { Request, Response } from "express";
import { createWalletSchema } from "./wallet.schema";
import { walletService } from "./wallet.service";


export const walletController = {

    async create(req: Request, res: Response) {
        const parsed = createWalletSchema.parse(req.body);

        const wallet = await walletService.create(parsed.ownerId);

        res.status(201).json(wallet);
    },

    async getBalance(req: Request, res: Response) {
        const { id } = req.params;

        if (!id || typeof id !== 'string' || id.trim() === '') {
            return res.status(400).json({ message: 'Invalid wallet ID' });
        }

        const balance = await walletService.getBalance(id);

        res.status(200).json({ balance });
    }
}