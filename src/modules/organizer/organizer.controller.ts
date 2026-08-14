import type { Response } from "express";

import type { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";

import {
    getOrganizerDashboard,
} from "./organizer.service.js";

export async function getOrganizerDashboardController(
    req: AuthenticatedRequest,
    res: Response,
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Usuário não autenticado",
            });
        }

        const dashboard =
            await getOrganizerDashboard(
                req.user.id,
            );

        return res.status(200).json(
            dashboard,
        );
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message:
                "Erro ao carregar dashboard do organizador",
        });
    }
}