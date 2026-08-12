import { prisma } from "../../config/database.js";

import type { CreateReservationInput } from "./reservation.schema.js";

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