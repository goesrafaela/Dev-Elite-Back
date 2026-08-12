import { prisma } from "../../config/database.js";

import type { PaymentInput } from "./payment.schema.js";

import {
    createTicketsForReservation,
} from "../tickets/ticket.service.js";

export async function approvePayment(
    reservationId: string,
    userId: string,
    data: PaymentInput,
) {
    return prisma.$transaction(async (tx) => {
        const reservation = await tx.reservation.findFirst({
            where: {
                id: reservationId,
                userId,
            },
            include: {
                payment: true,
                items: true,
            },
        });

        if (!reservation) {
            throw new Error("RESERVATION_NOT_FOUND");
        }

        if (reservation.status !== "PENDING") {
            throw new Error("RESERVATION_NOT_PENDING");
        }

        if (reservation.expiresAt <= new Date()) {
            await tx.reservation.update({
                where: {
                    id: reservation.id,
                },
                data: {
                    status: "EXPIRED",
                },
            });

            const eventSeatIds = reservation.items
                .map((item) => item.eventSeatId)
                .filter(
                    (id): id is string => id !== null,
                );

            await tx.eventSeat.updateMany({
                where: {
                    id: {
                        in: eventSeatIds,
                    },
                    status: "RESERVED",
                },
                data: {
                    status: "AVAILABLE",
                },
            });

            throw new Error("RESERVATION_EXPIRED");
        }

        const payment = await tx.payment.upsert({
            where: {
                reservationId: reservation.id,
            },
            create: {
                reservationId: reservation.id,
                amount: reservation.totalAmount,
                method: data.method,
                status: "APPROVED",
            },
            update: {
                amount: reservation.totalAmount,
                method: data.method,
                status: "APPROVED",
            },
        });

        const updatedReservation =
            await tx.reservation.update({
                where: {
                    id: reservation.id,
                },
                data: {
                    status: "CONFIRMED",
                },
            });

        const tickets =
            await createTicketsForReservation(
                tx,
                reservation.id,
            );

        return {
            payment,
            reservation: updatedReservation,
            tickets,
        };
    });
}

export async function declinePayment(
    reservationId: string,
    userId: string,
    data: PaymentInput,
) {
    return prisma.$transaction(async (tx) => {
        const reservation = await tx.reservation.findFirst({
            where: {
                id: reservationId,
                userId,
            },
            include: {
                payment: true,
                items: true,
            },
        });

        if (!reservation) {
            throw new Error("RESERVATION_NOT_FOUND");
        }

        if (reservation.status !== "PENDING") {
            throw new Error("RESERVATION_NOT_PENDING");
        }

        const payment = await tx.payment.upsert({
            where: {
                reservationId: reservation.id,
            },
            create: {
                reservationId: reservation.id,
                amount: reservation.totalAmount,
                method: data.method,
                status: "DECLINED",
            },
            update: {
                amount: reservation.totalAmount,
                method: data.method,
                status: "DECLINED",
            },
        });

        const updatedReservation =
            await tx.reservation.update({
                where: {
                    id: reservation.id,
                },
                data: {
                    status: "CANCELLED",
                },
            });

        const eventSeatIds = reservation.items
            .map((item) => item.eventSeatId)
            .filter(
                (id): id is string => id !== null,
            );

        await tx.eventSeat.updateMany({
            where: {
                id: {
                    in: eventSeatIds,
                },
                status: "RESERVED",
            },
            data: {
                status: "AVAILABLE",
            },
        });

        return {
            payment,
            reservation: updatedReservation,
        };
    });
}