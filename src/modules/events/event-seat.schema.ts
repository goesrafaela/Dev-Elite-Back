import { z } from "zod";

export const createEventSeatsSchema = z.object({
    price: z.number().positive(),
});

export type CreateEventSeatsInput = z.infer<
    typeof createEventSeatsSchema
>;