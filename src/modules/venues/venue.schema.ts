import { z } from "zod";

export const createVenueSchema = z.object({
    name: z.string().min(2),
    address: z.string().min(2),
    city: z.string().min(2),
    state: z.string().length(2),
    capacity: z.number().int().positive(),
});

export const createSeatSchema = z.object({
    row: z.string().min(1),
    number: z.number().int().positive(),
    section: z.string().optional(),
});

export type CreateVenueInput = z.infer<typeof createVenueSchema>;
export type CreateSeatInput = z.infer<typeof createSeatSchema>;