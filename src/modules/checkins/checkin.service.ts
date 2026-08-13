import { prisma } from "../../config/database.js";

export async function validateTicket(
    ticketCode: string,
    gateUserId: string,
) {
    return prisma.$transaction(async (tx) => {
        const ticket = await tx.ticket.findUnique({
            where: {
                ticketCode,
            },
            include: {
                event: {
                    select: {
                        id: true,
                        name: true,
                        startAt: true,
                        endAt: true,
                        status: true,
                        venue: {
                            select: {
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
            return {
                valid: false,
                status: "INVALID",
                message: "Ingresso inválido",
            };
        }

        if (ticket.status === "USED") {
            return {
                valid: false,
                status: "ALREADY_USED",
                message: "Ingresso já utilizado",
                ticket: {
                    id: ticket.id,
                    ticketCode: ticket.ticketCode,
                    status: ticket.status,
                    event: ticket.event,
                },
            };
        }

        if (ticket.status === "CANCELLED") {
            return {
                valid: false,
                status: "INVALID",
                message: "Ingresso cancelado",
            };
        }

        //Se já tiver sido utilizado o ingresso em outra portaria, não será possivel utilizar em outra portaria
        const updatedTicket = await tx.ticket.updateMany({
            where: {
                id: ticket.id,
                status: "VALID",
            },
            data: {
                status: "USED",
            },
        });

        if (updatedTicket.count === 0) {
            return {
                valid: false,
                status: "ALREADY_USED",
                message: "Ingresso já utilizado",
            };
        }

        //Se cria o ingresso validado para usado
        const checkIn = await tx.checkIn.create({
            data: {
                ticketId: ticket.id,
                gateUserId,
            },
        });

        return {
            valid: true,
            status: "VALID",
            message: "Entrada liberada",
            checkIn,
            ticket: {
                id: ticket.id,
                ticketCode: ticket.ticketCode,
                status: "USED",
                event: ticket.event,
                eventSeat: ticket.eventSeat,
                ticketType: ticket.ticketType,
            },
        };
    });
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