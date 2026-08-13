import type { Response, Request } from "express";

import type { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";

import {
    getUserTickets,
    getTicketById,
    generateTicketQRCode,
    getTicketByShareToken,
} from "./ticket.service.js";

export async function getMyTicketsController(
    req: AuthenticatedRequest,
    res: Response,
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Usuário não autenticado",
            });
        }

        const tickets = await getUserTickets(
            req.user.id,
        );

        return res.status(200).json({
            tickets,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Erro ao buscar ingressos",
        });
    }
}

export async function getTicketByIdController(
    req: AuthenticatedRequest,
    res: Response,
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Usuário não autenticado",
            });
        }

        const ticketId = Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id;

        if (!ticketId) {
            return res.status(400).json({
                message: "ID do ingresso inválido",
            });
        }

        const ticket = await getTicketById(
            ticketId,
            req.user.id,
        );

        return res.status(200).json({
            ticket,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "TICKET_NOT_FOUND"
        ) {
            return res.status(404).json({
                message: "Ingresso não encontrado",
            });
        }

        console.error(error);

        return res.status(500).json({
            message: "Erro ao buscar ingresso",
        });
    }
}

export async function getTicketQRCodeController(
    req: AuthenticatedRequest,
    res: Response,
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Usuário não autenticado",
            });
        }

        const ticketId = Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id;

        if (!ticketId) {
            return res.status(400).json({
                message: "ID do ingresso inválido",
            });
        }

        const result = await generateTicketQRCode(
            ticketId,
            req.user.id,
        );

        return res.status(200).json(result);
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "TICKET_NOT_FOUND"
        ) {
            return res.status(404).json({
                message: "Ingresso não encontrado",
            });
        }

        console.error(error);

        return res.status(500).json({
            message: "Erro ao gerar QR Code",
        });
    }
}

export async function getSharedTicketController(
    req: Request,
    res: Response,
) {
    try {
        const shareToken = Array.isArray(
            req.params.shareToken,
        )
            ? req.params.shareToken[0]
            : req.params.shareToken;

        if (!shareToken) {
            return res.status(400).json({
                message: "Token de compartilhamento inválido",
            });
        }

        const ticket = await getTicketByShareToken(
            shareToken,
        );

        return res.status(200).json({
            ticket,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "TICKET_NOT_FOUND"
        ) {
            return res.status(404).json({
                message: "Ingresso não encontrado",
            });
        }

        console.error(error);

        return res.status(500).json({
            message: "Erro ao buscar ingresso",
        });
    }
}