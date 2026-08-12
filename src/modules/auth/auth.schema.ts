import { z } from "zod";

export const registerSchema = z.object({
    name: z
        .string()
        .min(2, "Nome deve possuir pelo menos 2 caracteres"),

    email: z
        .string()
        .email("E-mail inválido"),

    password: z
        .string()
        .min(6, "Senha deve possuir pelo menos 6 caracteres"),

    role: z.enum(["CLIENT", "ORGANIZER", "GATE"]),
});

export const loginSchema = z.object({
    email: z
        .string()
        .email("E-mail inválido"),

    password: z
        .string()
        .min(1, "Senha é obrigatória"),
});