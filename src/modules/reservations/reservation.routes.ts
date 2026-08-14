import { Router } from "express";

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";

import {
    createReservationController,
    getReservationByIdController,
    payReservationController
} from "./reservation.controller.js";

const router = Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware("CLIENT"),
    createReservationController,
);

router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("CLIENT"),
    getReservationByIdController,
);

router.post(
    "/:id/pay",
    authMiddleware,
    roleMiddleware("CLIENT"),
    payReservationController,
);

export default router;