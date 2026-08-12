import { prisma } from "../../config/database.js";

import type { CreateEventSeatsInput } from "./event-seat.schema.js";

export async function createEventSeats(
    eventId: string,
    data: CreateEventSeatsInput,
) {
    const event = await prisma.event.findUnique({
        where: {
            id: eventId,
        },
        include: {
            venue: {
                include: {
                    seats: true,
                },
            },
        },
    });

    if (!event) {
        throw new Error("EVENT_NOT_FOUND");
    }

    if (event.venue.seats.length === 0) {
        throw new Error("VENUE_HAS_NO_SEATS");
    }

    const eventSeats = await prisma.eventSeat.createMany({
        data: event.venue.seats.map((seat) => ({
            eventId: event.id,
            seatId: seat.id,
            price: data.price,
            status: "AVAILABLE",
        })),
        skipDuplicates: true,
    });

    return eventSeats;
}

export async function getEventSeats(eventId: string) {
    const event = await prisma.event.findUnique({
        where: {
            id: eventId,
        },
        select: {
            id: true,
            name: true,
        },
    });

    if (!event) {
        throw new Error("EVENT_NOT_FOUND");
    }

    const seats = await prisma.eventSeat.findMany({
        where: {
            eventId,
        },
        include: {
            seat: true,
        },
        orderBy: [
            {
                seat: {
                    row: "asc",
                },
            },
            {
                seat: {
                    number: "asc",
                },
            },
        ],
    });

    return {
        event,
        seats,
    };
}