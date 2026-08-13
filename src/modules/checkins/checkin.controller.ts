import type { Response } from "express";

import type { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";

import {
    validateTicket,
} from "./checkin.service.js";

import {
    checkinSchema,
} from "./checkin.schema.js";

export async function validateTicketController(
    req: AuthenticatedRequest,
    res: Response,
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Usuário não autenticado",
            });
        }

        const data = checkinSchema.parse(req.body);

        const result = await validateTicket(
            data.ticketCode,
            req.user.id,
        );

        if (!result.valid) {
            return res.status(400).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        if (error instanceof Error) {
            if (error.name === "ZodError") {
                return res.status(400).json({
                    message: "Dados inválidos",
                });
            }
        }

        console.error(error);

        return res.status(500).json({
            message: "Erro ao validar ingresso",
        });
    }
}