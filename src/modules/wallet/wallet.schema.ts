import { z } from "zod";

export const createWalletSchema = z.object({
    ownerId: z.string().min(3, "Owner ID must be at least 3 characters long"),
})
