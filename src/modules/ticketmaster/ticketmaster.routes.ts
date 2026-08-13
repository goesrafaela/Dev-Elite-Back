import { Router } from "express";

import {
    searchTicketmasterEventsController,
    getTicketmasterEventByIdController
} from "./ticketmaster.controller.js";

const router = Router();

router.get(
    "/events",
    searchTicketmasterEventsController,
);

router.get(
    "/events/:id",
    getTicketmasterEventByIdController,
);
export default router;