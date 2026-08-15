import { prisma } from "../../config/database.js";

import type {
    CreateSeatInput,
    CreateVenueInput,
} from "./venue.schema.js";

export async function createVenue(
    data: CreateVenueInput,
) {
    const calculatedCapacity =
        data.rows * data.seatsPerRow;

    if (data.capacity !== calculatedCapacity) {
        throw new Error(
            "VENUE_CAPACITY_MISMATCH",
        );
    }

    const venue = await prisma.venue.create({
        data: {
            name: data.name,
            address: data.address,
            city: data.city,
            state: data.state,
            capacity: data.capacity,
            rows: data.rows,
            seatsPerRow: data.seatsPerRow,
        },
    });

    const seats = [];

    for (
        let rowIndex = 0;
        rowIndex < data.rows;
        rowIndex++
    ) {
        const row = String.fromCharCode(
            "A".charCodeAt(0) + rowIndex,
        );

        for (
            let number = 1;
            number <= data.seatsPerRow;
            number++
        ) {
            seats.push({
                venueId: venue.id,
                row,
                number,
            });
        }
    }

    await prisma.seat.createMany({
        data: seats,
    });

    return prisma.venue.findUnique({
        where: {
            id: venue.id,
        },
        include: {
            seats: {
                orderBy: [
                    {
                        row: "asc",
                    },
                    {
                        number: "asc",
                    },
                ],
            },
        },
    });
}

export async function getVenues() {
    return prisma.venue.findMany({
        orderBy: [
            {
                city: "asc",
            },
            {
                name: "asc",
            },
        ],
        include: {
            _count: {
                select: {
                    seats: true,
                    events: true,
                },
            },
        },
    });
}

export async function getVenueById(
    id: string,
) {
    return prisma.venue.findUnique({
        where: {
            id,
        },
        include: {
            seats: {
                orderBy: [
                    {
                        row: "asc",
                    },
                    {
                        number: "asc",
                    },
                ],
            },
        },
    });
}

export async function createSeat(
    venueId: string,
    data: CreateSeatInput,
) {
    const venue = await prisma.venue.findUnique({
        where: {
            id: venueId,
        },
    });

    if (!venue) {
        throw new Error("VENUE_NOT_FOUND");
    }

    const seat = await prisma.seat.create({
        data: {
            venueId,
            row: data.row,
            number: data.number,
            section: data.section,
        },
    });

    return seat;
}

export async function getVenueSeats(
    venueId: string,
) {
    return prisma.seat.findMany({
        where: {
            venueId,
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
}