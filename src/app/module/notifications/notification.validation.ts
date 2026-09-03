import { z } from "zod";

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