import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        role: "CLIENT" | "ORGANIZER" | "GATE";
    };
}

export function authMiddleware(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) {
    const authorization = req.headers.authorization;

    if (!authorization) {
        return res.status(401).json({
            message: "Token de autenticação não informado",
        });
    }

    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({
            message: "Formato do token inválido",
        });
    }

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET);

        if (
            typeof decoded === "string" ||
            !decoded.sub ||
            !decoded.role
        ) {
            return res.status(401).json({
                message: "Token inválido",
            });
        }

        req.user = {
            id: decoded.sub,
            role: decoded.role as "CLIENT" | "ORGANIZER" | "GATE",
        };

        next();
    } catch {
        return res.status(401).json({
            message: "Token inválido ou expirado",
        });
    }
}