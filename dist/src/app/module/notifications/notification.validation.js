import { z } from "zod";
export const createNotificationSchema = z.object({
    userId: z.string().uuid(),
    title: z
        .string()
        .trim()
        .min(1)
        .max(200),
    message: z
        .string()
        .trim()
        .min(1)
        .max(2000),
    type: z.enum([
        "SERVICE_REQUEST",
        "WORK_ORDER",
        "ASSIGNMENT",
        "SCHEDULE",
        "STATUS_UPDATE",
        "INVOICE",
        "PAYMENT",
        "SYSTEM",
    ]),
});
export const notificationParamsSchema = z.object({
    notificationId: z.string().uuid(),
});
export const notificationQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    isRead: z
        .enum(["true", "false"])
        .transform((value) => value === "true")
        .optional(),
});
