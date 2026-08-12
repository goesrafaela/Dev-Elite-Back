import type { Response } from "express";

import type { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";

import {
    createReservation,
} from "./reservation.service.js";

import {
    createReservationSchema,
} from "./reservation.schema.js";

export async function createReservationController(
    req: AuthenticatedRequest,
    res: Response,
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Usuário não autenticado",
            });
        }

        const data = createReservationSchema.parse(
            req.body,
        );

        const reservation = await createReservation(
            req.user.id,
            data,
        );

        return res.status(201).json({
            reservation,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.name === "ZodError"
        ) {
            return res.status(400).json({
                message: "Dados da reserva inválidos",
                errors: error,
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
            error.message === "EVENT_NOT_AVAILABLE"
        ) {
            return res.status(400).json({
                message: "Este evento não está disponível para reserva",
            });
        }

        if (
            error instanceof Error &&
            error.message === "SEAT_NOT_FOUND"
        ) {
            return res.status(404).json({
                message: "Um ou mais assentos não foram encontrados",
            });
        }

        if (
            error instanceof Error &&
            error.message === "SEAT_NOT_AVAILABLE"
        ) {
            return res.status(409).json({
                message: "Um ou mais assentos já foram reservados",
            });
        }

        console.error(error);

        return res.status(500).json({
            message: "Erro ao criar reserva",
        });
    }
}