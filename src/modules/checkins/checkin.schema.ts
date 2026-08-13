import { z } from "zod";

export const checkinSchema = z.object({
    ticketCode: z
        .string()
        .min(1, "Código do ingresso é obrigatório"),
});

export type CheckinInput = z.infer<typeof checkinSchema>;