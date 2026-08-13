import { Router } from "express";

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";

import {
    validateTicketController,
} from "./checkin.controller.js";

const router = Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware("GATE"),
    validateTicketController,
);

export default router;