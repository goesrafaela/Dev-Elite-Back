import { randomBytes } from "node:crypto";

import type { Prisma } from "../../../prisma/generated/prisma/client.js";

function generateTicketCode(): string {
    return `EVT-${randomBytes(6)
        .toString("hex")
        .toUpperCase()}`;
}

function generateShareToken(): string {
    return randomBytes(32).toString("hex");
}

export async function createTicketsForReservation(
    tx: Prisma.TransactionClient,
    reservationId: string,
) {
    const reservation = await tx.reservation.findUnique({
        where: {
            id: reservationId,
        },
        include: {
            items: {
                include: {
                    eventSeat: true,
                },
            },
        },
    });

    if (!reservation) {
        throw new Error("RESERVATION_NOT_FOUND");
    }

    if (reservation.status !== "CONFIRMED") {
        throw new Error("RESERVATION_NOT_CONFIRMED");
    }

    const existingTickets = await tx.ticket.count({
        where: {
            reservationId,
        },
    });

    if (existingTickets > 0) {
        throw new Error("TICKETS_ALREADY_CREATED");
    }

    const tickets = [];

    for (const item of reservation.items) {
        if (!item.eventSeatId) {
            continue;
        }

        const ticket = await tx.ticket.create({
            data: {
                reservationId: reservation.id,
                eventId: reservation.eventId,
                userId: reservation.userId,

                eventSeatId: item.eventSeatId,

                ticketCode: generateTicketCode(),
                shareToken: generateShareToken(),

                status: "VALID",
            },
        });

        tickets.push(ticket);
    }

    return tickets;
}