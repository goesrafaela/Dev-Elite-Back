import type { Response } from "express";

import type { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";

import {
    createEventSeats, getEventSeats
} from "./event-seat.service.js";

import {
    createEventSeatsSchema,
} from "./event-seat.schema.js";



function getParamId(value: string | string[]): string {
    const id = Array.isArray(value) ? value[0] : value;

    if (!id) {
        throw new Error("INVALID_ID");
    }

    return id;
}

export async function createEventSeatsController(
    req: AuthenticatedRequest,
    res: Response,
) {
    try {
        const eventId = getParamId(req.params.id);

        const data = createEventSeatsSchema.parse(req.body);

        const result = await createEventSeats(
            eventId,
            data,
        );

        return res.status(201).json({
            message: "Assentos do evento criados com sucesso",
            count: result.count,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "INVALID_ID"
        ) {
            return res.status(400).json({
                message: "ID do evento inválido",
            });
        }

        if (
            error instanceof Error &&
            error.message === "EVENT_NOT_FOUND"
        ) {
            return res.status(404).json({
                message: "Evento não encontrado",
            });
        }

        if (
            error instanceof Error &&
            error.message === "VENUE_HAS_NO_SEATS"
        ) {
            return res.status(400).json({
                message: "O local deste evento não possui assentos",
            });
        }

        if (
            error instanceof Error &&
            error.name === "ZodError"
        ) {
            return res.status(400).json({
                message: "Preço inválido",
                errors: error,
            });
        }

        console.error(error);

        return res.status(500).json({
            message: "Erro ao criar assentos do evento",
        });
    }
}

export async function getEventSeatsController(
    req: AuthenticatedRequest,
    res: Response,
) {
    try {
        const eventId = getParamId(req.params.id);

        const result = await getEventSeats(eventId);

        return res.status(200).json(result);
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "INVALID_ID"
        ) {
            return res.status(400).json({
                message: "ID do evento inválido",
            });
        }

        if (
            error instanceof Error &&
            error.message === "EVENT_NOT_FOUND"
        ) {
            return res.status(404).json({
                message: "Evento não encontrado",
            });
        }

        console.error(error);

        return res.status(500).json({
            message: "Erro ao buscar assentos do evento",
        });
    }
}