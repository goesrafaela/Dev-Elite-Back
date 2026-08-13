import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
    PORT: z.coerce.number().default(3000),

    DATABASE_URL: z.string().min(1),

    JWT_SECRET: z.string().min(1),

    JWT_EXPIRES_IN: z.string().default("1d"),

    TICKETMASTER_API_KEY: z.string().min(1),

    TICKETMASTER_BASE_URL: z
        .string()
        .url()
        .default(
            "https://app.ticketmaster.com/discovery/v2",
        ),
});

export const env = envSchema.parse({
    PORT: process.env.PORT,

    DATABASE_URL: process.env.DATABASE_URL,

    JWT_SECRET: process.env.JWT_SECRET,

    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,

    TICKETMASTER_API_KEY:
        process.env.TICKETMASTER_API_KEY,

    TICKETMASTER_BASE_URL:
        process.env.TICKETMASTER_BASE_URL,
});