import { z } from "zod";

export const createEventSeatsSchema =
    z.object({
        price: z
            .number()
            .positive(
                "O preço deve ser maior que zero",
            ),
    });

export type CreateEventSeatsInput =
    z.infer<
        typeof createEventSeatsSchema
    >;