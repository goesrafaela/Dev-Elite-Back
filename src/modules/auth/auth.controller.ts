import { Request, Response } from "express";

import {
    registerSchema,
    loginSchema,
} from "./auth.schema.js";

import * as authService from "./auth.service.js";

export async function register(
    req: Request,
    res: Response,
) {
    const data = registerSchema.parse(req.body);

    const user = await authService.register(data);

    return res.status(201).json({
        user,
    });
}

export async function login(
    req: Request,
    res: Response,
) {
    const data = loginSchema.parse(req.body);

    const result = await authService.login(data);

    return res.status(200).json(result);
}