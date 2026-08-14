import { Router } from "express";

import {
    authMiddleware,
} from "../../middlewares/auth.middleware.js";

import {
    roleMiddleware,
} from "../../middlewares/role.middleware.js";

import {
    getOrganizerDashboardController,
} from "./organizer.controller.js";

const router = Router();

router.get(
    "/dashboard",
    authMiddleware,
    roleMiddleware("ORGANIZER"),
    getOrganizerDashboardController,
);

export default router;