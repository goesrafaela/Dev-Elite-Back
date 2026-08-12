import { z } from "zod";

export const paymentSchema = z.object({
    method: z.enum([
        "CREDIT_CARD",
        "PIX",
        "DEBIT_CARD",
    ]),
});

export type PaymentInput = z.infer<typeof paymentSchema>;