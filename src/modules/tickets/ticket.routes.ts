import { Router } from "express";

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";

import {
    getMyTicketsController,
    getTicketByIdController,
    getTicketQRCodeController,
    getSharedTicketController,
} from "./ticket.controller.js";

const router = Router();

router.get(
    "/",
    authMiddleware,
    roleMiddleware("CLIENT"),
    getMyTicketsController,
);

router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("CLIENT"),
    getTicketByIdController,
);

router.get(
    "/:id/qrcode",
    authMiddleware,
    roleMiddleware("CLIENT"),
    getTicketQRCodeController,
);

router.get(
    "/share/:shareToken",
    getSharedTicketController,
);
export default router;