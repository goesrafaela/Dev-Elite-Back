import { z } from "zod";

export const createEventSchema = z.object({
    name: z.string().min(2),

    description: z.string().min(2),

    type: z.enum([
        "SHOW",
        "CINEMA",
        "THEATER",
        "SPORT",
        "OTHER",
    ]),

    venueId: z.string().uuid(),

    startAt: z.coerce.date(),

    endAt: z.coerce.date().optional(),
});

export type CreateEventInput = z.infer<
    typeof createEventSchema
>;