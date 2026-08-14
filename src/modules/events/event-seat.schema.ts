import { z } from "zod";

export const createEventSeatsSchema = z.object({
    rows: z.number().int().positive(),
    seatsPerRow: z.number().int().positive(),
    price: z.number().positive(),
});

export type CreateEventSeatsInput = z.infer<
    typeof createEventSeatsSchema
>;