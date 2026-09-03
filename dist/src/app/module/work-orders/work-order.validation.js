import { z } from "zod";
export const createWorkOrderParamsSchema = z.object({
    serviceRequestId: z.string().uuid(),
});
export const createWorkOrderSchema = z.object({
    description: z
        .string()
        .trim()
        .min(1, "Description cannot be empty")
        .max(2000, "Description cannot exceed 2000 characters")
        .optional(),
});
export const workOrderParamsSchema = z.object({
    workOrderId: z.string().uuid(),
});
export const updateWorkOrderSchema = z
    .object({
    description: z
        .string()
        .trim()
        .min(1, "Description cannot be empty")
        .max(2000, "Description cannot exceed 2000 characters")
        .optional(),
})
    .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
});
export const updateWorkOrderStatusSchema = z.object({
    status: z.enum([
        "OPEN",
        "SCHEDULED",
        "ASSIGNED",
        "EN_ROUTE",
        "IN_PROGRESS",
        "ON_HOLD",
        "COMPLETED",
        "CANCELLED",
    ]),
    reason: z
        .string()
        .trim()
        .max(500, "Reason cannot exceed 500 characters")
        .optional(),
});
export const scheduleWorkOrderSchema = z
    .object({
    scheduledStart: z.coerce.date(),
    scheduledEnd: z.coerce.date(),
})
    .refine((data) => data.scheduledEnd > data.scheduledStart, {
    message: "Scheduled end must be later than scheduled start",
    path: ["scheduledEnd"],
});
export const workOrderQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(10),
    status: z
        .enum([
        "OPEN",
        "SCHEDULED",
        "ASSIGNED",
        "EN_ROUTE",
        "IN_PROGRESS",
        "ON_HOLD",
        "COMPLETED",
        "CANCELLED",
    ])
        .optional(),
    sortBy: z
        .enum([
        "createdAt",
        "scheduledStart",
        "updatedAt",
    ])
        .default("createdAt"),
    sortOrder: z
        .enum(["asc", "desc"])
        .default("desc"),
});
