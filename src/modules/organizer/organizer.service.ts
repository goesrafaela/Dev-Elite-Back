import { prisma } from "../../config/database.js";

export async function getOrganizerDashboard(
    organizerId: string,
) {
    const events = await prisma.event.findMany({
        where: {
            organizerId,
        },

        include: {
            venue: true,

            tickets: {
                select: {
                    id: true,
                },
            },

            reservations: {
                where: {
                    payment: {
                        status: "APPROVED",
                    },
                },

                select: {
                    payment: {
                        select: {
                            amount: true,
                        },
                    },
                },
            },
        },

        orderBy: {
            createdAt: "desc",
        },
    });

    const totalEvents = events.length;

    const publishedEvents = events.filter(
        (event) => event.status === "PUBLISHED",
    ).length;

    const ticketsSold = events.reduce(
        (total, event) =>
            total + event.tickets.length,
        0,
    );

    const revenue = events.reduce(
        (total, event) =>
            total +
            event.reservations.reduce(
                (sum, reservation) =>
                    sum +
                    Number(
                        reservation.payment?.amount ?? 0,
                    ),
                0,
            ),
        0,
    );

    const eventList = events.map((event) => {
        const eventRevenue =
            event.reservations.reduce(
                (total, reservation) =>
                    total +
                    Number(
                        reservation.payment?.amount ?? 0,
                    ),
                0,
            );

        return {
            id: event.id,
            name: event.name,
            description: event.description,
            type: event.type,
            status: event.status,
            startAt: event.startAt,
            endAt: event.endAt,

            venue: {
                id: event.venue.id,
                name: event.venue.name,
                city: event.venue.city,
                state: event.venue.state,
            },

            ticketsSold: event.tickets.length,
            revenue: eventRevenue,
        };
    });

    return {
        summary: {
            totalEvents,
            publishedEvents,
            ticketsSold,
            revenue,
        },

        events: eventList,
    };
}