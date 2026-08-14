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
    });

    if (!event) {
        throw new Error("EVENT_NOT_FOUND");
    }

    const existingSeats = await prisma.eventSeat.count({
        where: {
            eventId,
        },
    });

    if (existingSeats > 0) {
        throw new Error("EVENT_SEATS_ALREADY_CREATED");
    }

    if (!event.rows || !event.seatsPerRow) {
        throw new Error(
            "EVENT_SEAT_CONFIGURATION_NOT_FOUND",
        );
    }

    const eventSeats = [];

    for (
        let rowIndex = 0;
        rowIndex < event.rows;
        rowIndex++
    ) {
        const row = String.fromCharCode(
            "A".charCodeAt(0) + rowIndex,
        );

        for (
            let number = 1;
            number <= event.seatsPerRow;
            number++
        ) {
            eventSeats.push({
                eventId: event.id,
                row,
                number,
                price: data.price,
                status: "AVAILABLE" as const,
            });
        }
    }

    const result = await prisma.eventSeat.createMany({
        data: eventSeats,
    });

    return result;
}


export async function getEventSeats(
    eventId: string,
) {
    const event = await prisma.event.findUnique({
        where: {
            id: eventId,
        },
        select: {
            id: true,
            name: true,
            rows: true,
            seatsPerRow: true,
        },
    });

    if (!event) {
        throw new Error("EVENT_NOT_FOUND");
    }

    const seats = await prisma.eventSeat.findMany({
        where: {
            eventId,
        },
        orderBy: [
            {
                row: "asc",
            },
            {
                number: "asc",
            },
        ],
    });

    return {
        event,
        seats,
    };
}