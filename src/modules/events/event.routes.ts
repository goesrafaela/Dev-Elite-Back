import { Router } from "express";

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";

import {
    createEventController, publishEventController
} from "./event.controller.js";

import {
    createEventSeatsController,
    getEventSeatsController,
} from "./event-seat.controller.js";

const router = Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware("ORGANIZER"),
    createEventController,
);

router.post(
    "/:id/seats",
    authMiddleware,
    roleMiddleware("ORGANIZER"),
    createEventSeatsController,
);

router.get(
    "/:id/seats",
    getEventSeatsController,
);

router.patch(
    "/:id/publish",
    authMiddleware,
    roleMiddleware("ORGANIZER"),
    publishEventController,
);

export default router;