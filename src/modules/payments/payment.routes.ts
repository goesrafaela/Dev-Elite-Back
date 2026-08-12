import { Router } from "express";

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";

import {
    approvePaymentController,
    declinePaymentController,
} from "./payment.controller.js";

const router = Router();

router.post(
    "/:id/approve",
    authMiddleware,
    roleMiddleware("CLIENT"),
    approvePaymentController,
);

router.post(
    "/:id/decline",
    authMiddleware,
    roleMiddleware("CLIENT"),
    declinePaymentController,
);

export default router;