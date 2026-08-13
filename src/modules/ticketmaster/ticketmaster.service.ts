import { env } from "../../config/env.js";

const TICKETMASTER_BASE_URL =
    env.TICKETMASTER_BASE_URL;

interface TicketmasterEvent {
    id: string;
    name: string;
    url?: string;

    dates?: {
        start?: {
            dateTime?: string;
            localDate?: string;
            localTime?: string;
        };
    };

    images?: Array<{
        url: string;
        width?: number;
        height?: number;
    }>;

    priceRanges?: Array<{
        min?: number;
        max?: number;
        currency?: string;
    }>;

    _embedded?: {
        venues?: Array<{
            name?: string;

            city?: {
                name?: string;
            };

            state?: {
                name?: string;
                stateCode?: string;
            };

            country?: {
                name?: string;
                countryCode?: string;
            };

            address?: {
                line1?: string;
            };
        }>;
    };
}

interface TicketmasterResponse {
    _embedded?: {
        events?: TicketmasterEvent[];
    };

    page?: {
        size: number;
        totalElements: number;
        totalPages: number;
        number: number;
    };
}

export interface SearchTicketmasterEventsParams {
    keyword?: string;
    city?: string;
    countryCode?: string;
    stateCode?: string;
    startDateTime?: string;
    endDateTime?: string;
    classificationName?: string;
    page?: number;
    size?: number;
}

export async function searchTicketmasterEvents(
    params: SearchTicketmasterEventsParams,
) {
    const url = new URL(
        `${TICKETMASTER_BASE_URL}/events.json`,
    );

    url.searchParams.set(
        "apikey",
        env.TICKETMASTER_API_KEY,
    );

    if (params.keyword) {
        url.searchParams.set(
            "keyword",
            params.keyword,
        );
    }

    if (params.city) {
        url.searchParams.set(
            "city",
            params.city,
        );
    }

    if (params.countryCode) {
        url.searchParams.set(
            "countryCode",
            params.countryCode,
        );
    }

    if (params.stateCode) {
        url.searchParams.set(
            "stateCode",
            params.stateCode,
        );
    }

    if (params.startDateTime) {
        url.searchParams.set(
            "startDateTime",
            params.startDateTime,
        );
    }

    if (params.endDateTime) {
        url.searchParams.set(
            "endDateTime",
            params.endDateTime,
        );
    }

    if (params.classificationName) {
        url.searchParams.set(
            "classificationName",
            params.classificationName,
        );
    }

    url.searchParams.set(
        "page",
        String(params.page ?? 0),
    );

    url.searchParams.set(
        "size",
        String(params.size ?? 20),
    );

    url.searchParams.set(
        "sort",
        "date,asc",
    );

    const response = await fetch(url);

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error(
                "TICKETMASTER_INVALID_API_KEY",
            );
        }

        throw new Error(
            "TICKETMASTER_API_ERROR",
        );
    }

    const data =
        (await response.json()) as TicketmasterResponse;

    const events =
        data._embedded?.events ?? [];

    return {
        events: events.map((event) => {
            const venue =
                event._embedded?.venues?.[0];

            const priceRange =
                event.priceRanges?.[0];

            return {
                externalId: event.id,

                name: event.name,

                url: event.url ?? null,

                startAt:
                    event.dates?.start?.dateTime ??
                    null,

                localDate:
                    event.dates?.start?.localDate ??
                    null,

                localTime:
                    event.dates?.start?.localTime ??
                    null,

                image:
                    event.images?.[0]?.url ??
                    null,

                price: priceRange
                    ? {
                        min: priceRange.min ?? null,
                        max: priceRange.max ?? null,
                        currency:
                            priceRange.currency ?? null,
                    }
                    : null,

                venue: venue
                    ? {
                        name: venue.name ?? null,

                        address:
                            venue.address?.line1 ??
                            null,

                        city:
                            venue.city?.name ??
                            null,

                        state:
                            venue.state?.name ??
                            null,

                        stateCode:
                            venue.state?.stateCode ??
                            null,

                        country:
                            venue.country?.name ??
                            null,

                        countryCode:
                            venue.country?.countryCode ??
                            null,
                    }
                    : null,
            };
        }),

        pagination: data.page ?? null,
    };
}

export async function getTicketmasterEventById(
    eventId: string,
) {
    const url = new URL(
        `${TICKETMASTER_BASE_URL}/events/${eventId}.json`,
    );

    url.searchParams.set(
        "apikey",
        env.TICKETMASTER_API_KEY,
    );

    const response = await fetch(url);

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error(
                "TICKETMASTER_INVALID_API_KEY",
            );
        }

        if (response.status === 404) {
            throw new Error(
                "TICKETMASTER_EVENT_NOT_FOUND",
            );
        }

        throw new Error(
            "TICKETMASTER_API_ERROR",
        );
    }

    const event =
        (await response.json()) as TicketmasterEvent;

    const venue =
        event._embedded?.venues?.[0];

    const priceRange =
        event.priceRanges?.[0];

    return {
        externalId: event.id,

        name: event.name,

        url: event.url ?? null,

        startAt:
            event.dates?.start?.dateTime ??
            null,

        localDate:
            event.dates?.start?.localDate ??
            null,

        localTime:
            event.dates?.start?.localTime ??
            null,

        image:
            event.images?.[0]?.url ??
            null,

        price: priceRange
            ? {
                min: priceRange.min ?? null,
                max: priceRange.max ?? null,
                currency:
                    priceRange.currency ?? null,
            }
            : null,

        venue: venue
            ? {
                name: venue.name ?? null,

                address:
                    venue.address?.line1 ??
                    null,

                city:
                    venue.city?.name ??
                    null,

                state:
                    venue.state?.name ??
                    null,

                stateCode:
                    venue.state?.stateCode ??
                    null,

                country:
                    venue.country?.name ??
                    null,

                countryCode:
                    venue.country?.countryCode ??
                    null,
            }
            : null,
    };
}