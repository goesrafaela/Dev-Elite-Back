import type { Response } from "express";

import type { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";

import {
    createReservation,
    getReservationById,
    payReservation
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

export async function getReservationByIdController(
    req: AuthenticatedRequest,
    res: Response,
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message:
                    "Usuário não autenticado",
            });
        }

        const reservationId =
            Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;

        if (!reservationId) {
            return res.status(400).json({
                message:
                    "ID da reserva inválido",
            });
        }

        const reservation =
            await getReservationById(
                reservationId,
                req.user.id,
            );

        return res.status(200).json({
            reservation,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message ===
            "RESERVATION_NOT_FOUND"
        ) {
            return res.status(404).json({
                message:
                    "Reserva não encontrada",
            });
        }

        console.error(error);

        return res.status(500).json({
            message:
                "Erro ao buscar reserva",
        });
    }
}

export async function payReservationController(
    req: AuthenticatedRequest,
    res: Response,
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Usuário não autenticado",
            });
        }

        const reservationId =
            Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;

        if (!reservationId) {
            return res.status(400).json({
                message: "ID da reserva inválido",
            });
        }

        const result =
            await payReservation(
                reservationId,
                req.user.id,
            );

        return res.status(200).json(result);
    } catch (error) {
        if (
            error instanceof Error &&
            error.message ===
            "RESERVATION_NOT_FOUND"
        ) {
            return res.status(404).json({
                message: "Reserva não encontrada",
            });
        }

        if (
            error instanceof Error &&
            error.message ===
            "RESERVATION_ALREADY_PAID"
        ) {
            return res.status(409).json({
                message: "Reserva já foi paga",
            });
        }

        if (
            error instanceof Error &&
            error.message ===
            "RESERVATION_EXPIRED"
        ) {
            return res.status(409).json({
                message: "Reserva expirada",
            });
        }

        if (
            error instanceof Error &&
            error.message ===
            "RESERVATION_NOT_AVAILABLE"
        ) {
            return res.status(409).json({
                message:
                    "Esta reserva não está disponível para pagamento",
            });
        }

        console.error(error);

        return res.status(500).json({
            message:
                "Erro ao processar pagamento",
        });
    }
}