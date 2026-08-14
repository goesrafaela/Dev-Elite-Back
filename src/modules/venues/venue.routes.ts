import { Router } from "express";

import {
    authMiddleware,
} from "../../middlewares/auth.middleware.js";

import {
    roleMiddleware,
} from "../../middlewares/role.middleware.js";

import {
    createSeatController,
    createVenueController,
    getVenueController,
    getVenueSeatsController,
    getVenuesController
} from "./venue.controller.js";

const router = Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware("ORGANIZER"),
    createVenueController,
);

router.get(
    "/",
    getVenuesController,
);

router.get(
    "/:id",
    getVenueController,
);

router.post(
    "/:id/seats",
    authMiddleware,
    roleMiddleware("ORGANIZER"),
    createSeatController,
);

router.get(
    "/:id/seats",
    getVenueSeatsController,
);

export default router;