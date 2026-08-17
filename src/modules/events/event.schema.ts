import { z } from "zod";

export const createEventSchema = z.object({
  name: z
    .string()
    .min(1, "O nome do evento é obrigatório")
    .max(150, "O nome do evento deve ter no máximo 150 caracteres"),

  description: z
    .string()
    .min(1, "A descrição é obrigatória"),

  type: z.enum([
    "SHOW",
    "CINEMA",
    "THEATER",
    "SPORT",
    "OTHER",
  ]),

  venueId: z
    .string()
    .uuid("ID do local inválido"),

  startAt: z.coerce.date(),

  endAt: z.coerce.date().optional(),
}).superRefine((data, ctx) => {
  if (data.endAt && data.endAt <= data.startAt) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["endAt"],
      message: "O término deve ser posterior ao início",
    });
  }
});

export const updateEventSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(150)
    .optional(),

  description: z
    .string()
    .min(1)
    .optional(),

  type: z
    .enum([
      "SHOW",
      "CINEMA",
      "THEATER",
      "SPORT",
      "OTHER",
    ])
    .optional(),

  venueId: z
    .string()
    .uuid()
    .optional(),

  startAt: z.coerce.date().optional(),

  endAt: z.coerce.date().nullable().optional(),

  status: z
    .enum([
      "DRAFT",
      "PUBLISHED",
      "CANCELLED",
      "FINISHED",
    ])
    .optional(),
});

export type CreateEventInput = z.infer<
  typeof createEventSchema
>;

export type UpdateEventInput = z.infer<
  typeof updateEventSchema
>;