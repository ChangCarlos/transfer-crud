import z from "zod";


export const transferSchema = z.object({
    fromWalletId: z.string("From Wallet ID must be a string").min(1, "From Wallet ID is required"),
    toWalletId: z.string("To Wallet ID must be a string").min(1, "To Wallet ID is required"),
    amount: z.number("Amount must be a number").positive("Amount must be greater than zero"),
})