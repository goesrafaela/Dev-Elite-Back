import { z } from "zod";

export const createVenueSchema = z.object({
    name: z
        .string()
        .min(2, "O nome deve ter pelo menos 2 caracteres"),

    address: z
        .string()
        .min(2, "O endereço deve ter pelo menos 2 caracteres"),

    city: z
        .string()
        .min(2, "A cidade deve ter pelo menos 2 caracteres"),

    state: z
        .string()
        .length(2, "O estado deve possuir 2 caracteres")
        .transform((value) => value.toUpperCase()),

    rows: z
        .number()
        .int()
        .positive("A quantidade de fileiras deve ser maior que zero"),

    seatsPerRow: z
        .number()
        .int()
        .positive(
            "A quantidade de assentos por fileira deve ser maior que zero",
        ),

    capacity: z
        .number()
        .int()
        .positive("A capacidade deve ser maior que zero"),
});

export const createSeatSchema = z.object({
    row: z.string().min(1),

    number: z
        .number()
        .int()
        .positive(),

    section: z
        .string()
        .optional(),
});

export type CreateVenueInput =
    z.infer<typeof createVenueSchema>;

export type CreateSeatInput =
    z.infer<typeof createSeatSchema>;