import { z } from "zod";

export const createReservationSchema = z.object({
    eventId: z.string().uuid(),

    eventSeatIds: z
        .array(z.string().uuid())
        .min(1, "Selecione pelo menos um assento"),
});

export type CreateReservationInput = z.infer<
    typeof createReservationSchema
>;