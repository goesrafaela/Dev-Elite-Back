import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
    PORT: z.coerce.number().default(3000),

    DATABASE_URL: z.string().min(1),

    JWT_SECRET: z.string().min(1),

    JWT_EXPIRES_IN: z.string().default("1d"),

    TICKETMASTER_API_KEY: z.string().optional(),

    TICKETMASTER_BASE_URL: z
        .string()
        .default("https://app.ticketmaster.com/discovery/v2"),
});

export const env = envSchema.parse(process.env);