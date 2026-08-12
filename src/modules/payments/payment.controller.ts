import type { Response } from "express";

import type { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";

import {
    approvePayment,
    declinePayment,
} from "./payment.service.js";

import {
    paymentSchema,
} from "./payment.schema.js";

function getParamId(
    value: string | string[],
): string {
    const id = Array.isArray(value)
        ? value[0]
        : value;

    if (!id) {
        throw new Error("INVALID_ID");
    }

    return id;
}

export async function approvePaymentController(
    req: AuthenticatedRequest,
    res: Response,
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Usuário não autenticado",
            });
        }

        const reservationId = getParamId(
            req.params.id,
        );

        const data = paymentSchema.parse(req.body);

        const result = await approvePayment(
            reservationId,
            req.user.id,
            data,
        );

        return res.status(200).json({
            message: "Pagamento aprovado",
            ...result,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.name === "ZodError"
        ) {
            return res.status(400).json({
                message: "Dados do pagamento inválidos",
            });
        }

        if (
            error instanceof Error &&
            error.message === "INVALID_ID"
        ) {
            return res.status(400).json({
                message: "ID da reserva inválido",
            });
        }

        if (
            error instanceof Error &&
            error.message === "RESERVATION_NOT_FOUND"
        ) {
            return res.status(404).json({
                message: "Reserva não encontrada",
            });
        }

        if (
            error instanceof Error &&
            error.message === "RESERVATION_NOT_PENDING"
        ) {
            return res.status(409).json({
                message: "Esta reserva não está pendente",
            });
        }

        if (
            error instanceof Error &&
            error.message === "RESERVATION_EXPIRED"
        ) {
            return res.status(409).json({
                message: "Esta reserva expirou",
            });
        }

        console.error(error);

        return res.status(500).json({
            message: "Erro ao processar pagamento",
        });
    }
}

export async function declinePaymentController(
    req: AuthenticatedRequest,
    res: Response,
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Usuário não autenticado",
            });
        }

        const reservationId = getParamId(
            req.params.id,
        );

        const data = paymentSchema.parse(req.body);

        const result = await declinePayment(
            reservationId,
            req.user.id,
            data,
        );

        return res.status(200).json({
            message: "Pagamento recusado",
            ...result,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.name === "ZodError"
        ) {
            return res.status(400).json({
                message: "Dados do pagamento inválidos",
            });
        }

        if (
            error instanceof Error &&
            error.message === "INVALID_ID"
        ) {
            return res.status(400).json({
                message: "ID da reserva inválido",
            });
        }

        if (
            error instanceof Error &&
            error.message === "RESERVATION_NOT_FOUND"
        ) {
            return res.status(404).json({
                message: "Reserva não encontrada",
            });
        }

        if (
            error instanceof Error &&
            error.message === "RESERVATION_NOT_PENDING"
        ) {
            return res.status(409).json({
                message: "Esta reserva não está pendente",
            });
        }

        console.error(error);

        return res.status(500).json({
            message: "Erro ao processar pagamento",
        });
    }
}