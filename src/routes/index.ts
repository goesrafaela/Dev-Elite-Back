import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import venueRoutes from "../modules/venues/venue.routes.js";
import eventRoutes from "../modules/events/event.routes.js";
import reservationRoutes from "../modules/reservations/reservation.routes.js";
import paymentRoutes from "../modules/payments/payment.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
    return res.status(200).json({
        status: "ok",
        message: "API funcionando",
    });
});

router.get(
    "/me",
    authMiddleware,
    (req: AuthenticatedRequest, res) => {
        return res.json({
            user: req.user,
        });
    },
);
//Rota teste para permissões
router.get(
    "/test/organizer",
    authMiddleware,
    roleMiddleware("ORGANIZER"),
    (req: AuthenticatedRequest, res) => {
        return res.json({
            message: "Você é um ORGANIZER e pode acessar esta rota.",
            user: req.user,
        });
    },
);



router.use("/auth", authRoutes);
router.use("/venues", venueRoutes);
router.use("/events", eventRoutes);
router.use("/reservations", reservationRoutes,);
router.use("/payments", paymentRoutes);

export default router;