import { Router } from "express";

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";

import {
    createReservationController,
} from "./reservation.controller.js";

const router = Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware("CLIENT"),
    createReservationController,
);

export default router;