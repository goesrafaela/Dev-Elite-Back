import { prisma } from "../../config/database.js";

import type { CreateEventInput } from "./event.schema.js";

export async function createEvent(
    organizerId: string,
    data: CreateEventInput,
) {
    const venue = await prisma.venue.findUnique({
        where: {
            id: data.venueId,
        },
    });

    if (!venue) {
        throw new Error("VENUE_NOT_FOUND");
    }

    const event = await prisma.event.create({
        data: {
            organizerId,
            venueId: data.venueId,

            name: data.name,
            description: data.description,
            type: data.type,

            status: "DRAFT",

            startAt: data.startAt,
            endAt: data.endAt,
        },
        include: {
            venue: true,
        },
    });

    return event;
}

export async function publishEvent(
    eventId: string,
    organizerId: string,
) {
    const event = await prisma.event.findFirst({
        where: {
            id: eventId,
            organizerId,
        },
    });

    if (!event) {
        throw new Error("EVENT_NOT_FOUND");
    }

    if (event.status !== "DRAFT") {
        throw new Error("EVENT_NOT_DRAFT");
    }

    const updatedEvent = await prisma.event.update({
        where: {
            id: event.id,
        },
        data: {
            status: "PUBLISHED",
        },
    });

    return updatedEvent;
}