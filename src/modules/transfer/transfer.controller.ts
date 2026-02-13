import { Request, Response } from "express";
import { transferService } from "./transfer.service";
import { transferSchema } from "./transfer.schema";


export const TransferController = {

    async execute(req: Request, res: Response) {
        const idempotencyKey = req.headers["idempotency-key"] as string;

        if(!idempotencyKey) {
            return res.status(400).json({ error: "Idempotency-Key header is required" });
        }

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(idempotencyKey)) {
            return res.status(400).json({ error: "Idempotency-Key must be a valid UUID" });
        }

        const parsed = transferSchema.parse(req.body);

        const result = await transferService.execute(parsed, idempotencyKey);

        res.status(200).json(result);
    }
}