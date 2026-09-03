import { z } from "zod";

export const createAvailabilitySchema = z.object({
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
    status: z
        .enum(["AVAILABLE", "UNAVAILABLE"])
        .default("AVAILABLE"),
}).refine(
    (data) => data.endAt > data.startAt,
    {
        message: "End time must be later than start time",
        path: ["endAt"],
    },
);

export const availabilityParamsSchema = z.object({
    availabilityId: z.string().uuid(),
});

export const updateAvailabilitySchema = z.object({
    startAt: z.coerce.date().optional(),
    endAt: z.coerce.date().optional(),
    status: z
        .enum(["AVAILABLE", "UNAVAILABLE"])
        .optional(),
}).refine(
    (data) => Object.keys(data).length > 0,
    {
        message: "At least one field must be provided",
    },
).refine(
    (data) =>
        !data.startAt ||
        !data.endAt ||
        data.endAt > data.startAt,
    {
        message: "End time must be later than start time",
        path: ["endAt"],
    },
);