import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";

import {
    createEvent,
    publishEvent,
    getPublishedEvents,
    getEventById,
} from "./event.service.js";

import {
    createEventSchema,
    updateEventSchema,
} from "./event.schema.js";

export async function createEventController(
    req: AuthenticatedRequest,
    res: Response,
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Usuário não autenticado",
            });
        }

        const data = createEventSchema.parse(req.body);

        const event = await createEvent(
            req.user.id,
            data,
        );

        return res.status(201).json({
            event,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "VENUE_NOT_FOUND"
        ) {
            return res.status(404).json({
                message: "Local não encontrado",
            });
        }

        if (
            error instanceof Error &&
            error.name === "ZodError"
        ) {
            return res.status(400).json({
                message: "Dados do evento inválidos",
                errors: error,
            });
        }

        console.error("Erro ao criar evento:", error);

        return res.status(500).json({
            message: "Erro ao criar evento",
        });
    }
}

export async function publishEventController(
    req: AuthenticatedRequest,
    res: Response,
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Usuário não autenticado",
            });
        }

        const eventId = Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id;

        if (!eventId) {
            return res.status(400).json({
                message: "ID do evento inválido",
            });
        }

        const event = await publishEvent(
            eventId,
            req.user.id,
        );

        return res.status(200).json({
            message: "Evento publicado com sucesso",
            event,
        });
    } catch (error) {
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
            error.message === "EVENT_NOT_DRAFT"
        ) {
            return res.status(400).json({
                message: "O evento não está em rascunho",
            });
        }

        console.error("Erro ao publicar evento:", error);

        return res.status(500).json({
            message: "Erro ao publicar evento",
        });
    }
}

export async function getPublishedEventsController(
    req: Request,
    res: Response,
) {
    try {
        const events = await getPublishedEvents();

        return res.status(200).json({
            events,
        });
    } catch (error) {
        console.error(
            "Erro ao buscar eventos publicados:",
            error,
        );

        return res.status(500).json({
            message: "Erro ao buscar eventos",
        });
    }
}

export async function getEventByIdController(
    req: Request,
    res: Response,
) {
    try {
        const eventId = Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id;

        if (!eventId) {
            return res.status(400).json({
                message: "ID do evento inválido",
            });
        }

        const event = await getEventById(eventId);

        return res.status(200).json({
            event,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "EVENT_NOT_FOUND"
        ) {
            return res.status(404).json({
                message: "Evento não encontrado",
            });
        }

        console.error(
            "Erro ao buscar evento:",
            error,
        );

        return res.status(500).json({
            message: "Erro ao buscar evento",
        });
    }
}
