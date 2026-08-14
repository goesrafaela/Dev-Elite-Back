import { prisma } from "../../config/database.js";

import type { CreateReservationInput } from "./reservation.schema.js";
import { createTicketsForReservation } from "../tickets/ticket.service.js";

export async function createReservation(
    userId: string,
    data: CreateReservationInput,
) {
    return prisma.$transaction(async (tx) => {
        const event = await tx.event.findUnique({
            where: {
                id: data.eventId,
            },
        });

        if (!event) {
            throw new Error("EVENT_NOT_FOUND");
        }

        if (event.status !== "PUBLISHED") {
            throw new Error("EVENT_NOT_AVAILABLE");
        }

        const eventSeats = await tx.eventSeat.findMany({
            where: {
                id: {
                    in: data.eventSeatIds,
                },
                eventId: data.eventId,
            },
            include: {
                seat: true,
            },
        });

        if (eventSeats.length !== data.eventSeatIds.length) {
            throw new Error("SEAT_NOT_FOUND");
        }

        const unavailableSeat = eventSeats.find(
            (eventSeat) =>
                eventSeat.status !== "AVAILABLE",
        );

        if (unavailableSeat) {
            throw new Error("SEAT_NOT_AVAILABLE");
        }

        const totalAmount = eventSeats.reduce(
            (total, eventSeat) =>
                total + Number(eventSeat.price),
            0,
        );

        const expiresAt = new Date(
            Date.now() + 15 * 60 * 1000,
        );

        const reservation = await tx.reservation.create({
            data: {
                userId,
                eventId: data.eventId,
                status: "PENDING",
                totalAmount,
                expiresAt,

                items: {
                    create: eventSeats.map((eventSeat) => ({
                        eventSeatId: eventSeat.id,
                        quantity: 1,
                        unitPrice: eventSeat.price,
                    })),
                },
            },

            include: {
                items: {
                    include: {
                        eventSeat: {
                            include: {
                                seat: true,
                            },
                        },
                    },
                },
            },
        });

        const updated = await tx.eventSeat.updateMany({
            where: {
                id: {
                    in: data.eventSeatIds,
                },
                eventId: data.eventId,
                status: "AVAILABLE",
            },

            data: {
                status: "RESERVED",
            },
        });

        if (updated.count !== data.eventSeatIds.length) {
            throw new Error("SEAT_NOT_AVAILABLE");
        }

        return reservation;
    });
}

export async function getReservationById(
    reservationId: string,
    userId: string,
) {
    const reservation =
        await prisma.reservation.findFirst({
            where: {
                id: reservationId,
                userId,
            },
            include: {
                event: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        type: true,
                        startAt: true,
                        endAt: true,
                        status: true,
                        venue: {
                            select: {
                                id: true,
                                name: true,
                                address: true,
                                city: true,
                                state: true,
                            },
                        },
                    },
                },

                items: {
                    include: {
                        eventSeat: {
                            include: {
                                seat: true,
                            },
                        },
                    },
                },
            },
        });

    if (!reservation) {
        throw new Error(
            "RESERVATION_NOT_FOUND",
        );
    }

    return reservation;
}

export async function payReservation(
    reservationId: string,
    userId: string,
) {
    return prisma.$transaction(async (tx) => {
        const reservation =
            await tx.reservation.findFirst({
                where: {
                    id: reservationId,
                    userId,
                },
                include: {
                    items: true,
                },
            });

        if (!reservation) {
            throw new Error(
                "RESERVATION_NOT_FOUND",
            );
        }

        if (reservation.status === "CONFIRMED") {
            throw new Error(
                "RESERVATION_ALREADY_PAID",
            );
        }

        if (reservation.status !== "PENDING") {
            throw new Error(
                "RESERVATION_NOT_AVAILABLE",
            );
        }

        if (
            reservation.expiresAt &&
            reservation.expiresAt < new Date()
        ) {
            throw new Error(
                "RESERVATION_EXPIRED",
            );
        }

        const updatedReservation =
            await tx.reservation.update({
                where: {
                    id: reservation.id,
                },
                data: {
                    status: "CONFIRMED",
                },
            });

        await tx.eventSeat.updateMany({
            where: {
                id: {
                    in: reservation.items.map(
                        (item) => item.eventSeatId,
                    ),
                },
                status: "RESERVED",
            },
            data: {
                status: "SOLD",
            },
        });

        const tickets =
            await createTicketsForReservation(
                tx,
                reservation.id,
            );

        return {
            reservation: updatedReservation,
            tickets,
        };
    });
}