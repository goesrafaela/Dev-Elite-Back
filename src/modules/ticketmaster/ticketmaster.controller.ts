import type { Request, Response } from "express";

import {
    searchTicketmasterEvents,
    getTicketmasterEventById
} from "./ticketmaster.service.js";

export async function searchTicketmasterEventsController(
    req: Request,
    res: Response,
) {
    try {
        const {
            keyword,
            city,
            countryCode,
            stateCode,
            startDateTime,
            endDateTime,
            classificationName,
            page,
            size,
        } = req.query;

        const result =
            await searchTicketmasterEvents({
                keyword:
                    typeof keyword === "string"
                        ? keyword
                        : undefined,

                city:
                    typeof city === "string"
                        ? city
                        : undefined,

                countryCode:
                    typeof countryCode === "string"
                        ? countryCode
                        : undefined,

                stateCode:
                    typeof stateCode === "string"
                        ? stateCode
                        : undefined,

                startDateTime:
                    typeof startDateTime === "string"
                        ? startDateTime
                        : undefined,

                endDateTime:
                    typeof endDateTime === "string"
                        ? endDateTime
                        : undefined,

                classificationName:
                    typeof classificationName === "string"
                        ? classificationName
                        : undefined,

                page:
                    typeof page === "string"
                        ? Number(page)
                        : undefined,

                size:
                    typeof size === "string"
                        ? Number(size)
                        : undefined,
            });

        return res.status(200).json(result);
    } catch (error) {
        if (
            error instanceof Error &&
            error.message ===
            "TICKETMASTER_INVALID_API_KEY"
        ) {
            return res.status(401).json({
                message:
                    "Chave da Ticketmaster inválida",
            });
        }

        console.error(error);

        return res.status(502).json({
            message:
                "Erro ao consultar a Ticketmaster",
        });
    }
}

export async function getTicketmasterEventByIdController(
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

        const event =
            await getTicketmasterEventById(
                eventId,
            );

        return res.status(200).json({
            event,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message ===
            "TICKETMASTER_EVENT_NOT_FOUND"
        ) {
            return res.status(404).json({
                message:
                    "Evento não encontrado na Ticketmaster",
            });
        }

        if (
            error instanceof Error &&
            error.message ===
            "TICKETMASTER_INVALID_API_KEY"
        ) {
            return res.status(401).json({
                message:
                    "Chave da Ticketmaster inválida",
            });
        }

        console.error(error);

        return res.status(502).json({
            message:
                "Erro ao consultar evento da Ticketmaster",
        });
    }
}