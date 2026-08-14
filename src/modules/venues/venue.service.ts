import { prisma } from "../../config/database.js";
import type {
    CreateSeatInput,
    CreateVenueInput,
} from "./venue.schema.js";

export async function createVenue(data: CreateVenueInput) {
    return prisma.venue.create({
        data: {
            name: data.name,
            address: data.address,
            city: data.city,
            state: data.state,
            capacity: data.capacity,
        },
    });
}

export async function getVenueById(id: string) {
    return prisma.venue.findUnique({
        where: { id },
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
        where: { id: venueId },
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

export async function getVenueSeats(venueId: string) {
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
export async function getVenues() {
    return prisma.venue.findMany({
        orderBy: {
            name: "asc",
        },
    });
}