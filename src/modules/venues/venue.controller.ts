import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";

import {
    createSeat,
    createVenue,
    getVenueById,
    getVenueSeats,
    getVenues,
} from "./venue.service.js";

import {
    createSeatSchema,
    createVenueSchema,
} from "./venue.schema.js";

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

export async function createVenueController(
    req: AuthenticatedRequest,
    res: Response,
) {
    try {
        const data = createVenueSchema.parse(
            req.body,
        );

        const venue = await createVenue(data);

        return res.status(201).json({
            venue,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.name === "ZodError"
        ) {
            return res.status(400).json({
                message: "Dados do local inválidos",
                errors: error,
            });
        }

        if (
            error instanceof Error &&
            error.message ===
            "VENUE_CAPACITY_MISMATCH"
        ) {
            return res.status(400).json({
                message:
                    "A capacidade deve ser igual ao número de fileiras multiplicado pelos assentos por fileira",
            });
        }

        console.error(error);

        return res.status(500).json({
            message: "Erro ao criar local",
        });
    }
}

export async function getVenuesController(
    req: Request,
    res: Response,
) {
    try {
        const venues = await getVenues();

        return res.status(200).json({
            venues,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Erro ao buscar locais",
        });
    }
}

export async function getVenueController(
    req: Request,
    res: Response,
) {
    try {
        const id = getParamId(req.params.id);

        const venue = await getVenueById(id);

        if (!venue) {
            return res.status(404).json({
                message: "Local não encontrado",
            });
        }

        return res.status(200).json({
            venue,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "INVALID_ID"
        ) {
            return res.status(400).json({
                message: "ID do local inválido",
            });
        }

        console.error(error);

        return res.status(500).json({
            message: "Erro ao buscar local",
        });
    }
}

export async function createSeatController(
    req: AuthenticatedRequest,
    res: Response,
) {
    try {
        const venueId = getParamId(
            req.params.id,
        );

        const data = createSeatSchema.parse(
            req.body,
        );

        const seat = await createSeat(
            venueId,
            data,
        );

        return res.status(201).json({
            seat,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "INVALID_ID"
        ) {
            return res.status(400).json({
                message: "ID do local inválido",
            });
        }

        if (
            error instanceof Error &&
            error.message ===
            "VENUE_NOT_FOUND"
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
                message:
                    "Dados do assento inválidos",
                errors: error,
            });
        }

        console.error(error);

        return res.status(500).json({
            message: "Erro ao criar assento",
        });
    }
}

export async function getVenueSeatsController(
    req: Request,
    res: Response,
) {
    try {
        const venueId = getParamId(
            req.params.id,
        );

        const venue =
            await getVenueById(venueId);

        if (!venue) {
            return res.status(404).json({
                message: "Local não encontrado",
            });
        }

        const seats =
            await getVenueSeats(venueId);

        return res.status(200).json({
            seats,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "INVALID_ID"
        ) {
            return res.status(400).json({
                message:
                    "ID do local inválido",
            });
        }

        console.error(error);

        return res.status(500).json({
            message:
                "Erro ao buscar assentos",
        });
    }
}