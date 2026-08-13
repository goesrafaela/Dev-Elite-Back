import { randomBytes } from "node:crypto";

import QRCode from "qrcode";

import { prisma } from "../../config/database.js";

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

export async function getUserTickets(
    userId: string,
) {
    return prisma.ticket.findMany({
        where: {
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
            eventSeat: {
                include: {
                    seat: true,
                },
            },
            ticketType: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}

export async function getTicketById(
    ticketId: string,
    userId: string,
) {
    const ticket = await prisma.ticket.findFirst({
        where: {
            id: ticketId,
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
            eventSeat: {
                include: {
                    seat: true,
                },
            },
            ticketType: true,
            reservation: {
                select: {
                    id: true,
                    totalAmount: true,
                    status: true,
                },
            },
        },
    });

    if (!ticket) {
        throw new Error("TICKET_NOT_FOUND");
    }

    return ticket;
}

export async function generateTicketQRCode(
    ticketId: string,
    userId: string,
) {
    const ticket = await prisma.ticket.findFirst({
        where: {
            id: ticketId,
            userId,
        },
        select: {
            id: true,
            ticketCode: true,
            status: true,
            event: {
                select: {
                    name: true,
                    startAt: true,
                },
            },
        },
    });

    if (!ticket) {
        throw new Error("TICKET_NOT_FOUND");
    }

    const qrCode = await QRCode.toDataURL(
        ticket.ticketCode,
        {
            errorCorrectionLevel: "H",
            margin: 2,
            width: 400,
        },
    );

    return {
        ticketId: ticket.id,
        ticketCode: ticket.ticketCode,
        status: ticket.status,
        event: ticket.event,
        qrCode,
    };
}

export async function getTicketByShareToken(
    shareToken: string,
) {
    const ticket = await prisma.ticket.findUnique({
        where: {
            shareToken,
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
            eventSeat: {
                include: {
                    seat: true,
                },
            },
            ticketType: true,
        },
    });

    if (!ticket) {
        throw new Error("TICKET_NOT_FOUND");
    }

    return {
        id: ticket.id,
        ticketCode: ticket.ticketCode,
        status: ticket.status,

        event: ticket.event,

        seat: ticket.eventSeat
            ? {
                row: ticket.eventSeat.seat.row,
                number: ticket.eventSeat.seat.number,
                section: ticket.eventSeat.seat.section,
            }
            : null,

        ticketType: ticket.ticketType
            ? {
                id: ticket.ticketType.id,
                name: ticket.ticketType.name,
                price: ticket.ticketType.price,
            }
            : null,
    };
}