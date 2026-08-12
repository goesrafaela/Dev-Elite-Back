import type { NextFunction, Response } from "express";

import type { AuthenticatedRequest } from "./auth.middleware.js";

type Role = "CLIENT" | "ORGANIZER" | "GATE";

export function roleMiddleware(...allowedRoles: Role[]) {
    return (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction,
    ) => {
        if (!req.user) {
            return res.status(401).json({
                message: "Usuário não autenticado",
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Você não possui permissão para realizar esta ação",
            });
        }

        next();
    };
}