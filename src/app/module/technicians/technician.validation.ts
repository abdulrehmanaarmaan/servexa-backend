import { z } from "zod";

export const technicianParamsSchema = z.object({
    technicianId: z.string().uuid(),
});

export const updateTechnicianSchema = z.object({
    name: z.string().trim().min(2).max(100).optional(),
    phone: z.string().trim().min(7).max(20).optional(),
}).refine(
    (data) => Object.keys(data).length > 0,
    {
        message: "At least one field must be provided",
    },
);

export const technicianQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().max(100).optional(),
    isActive: z
        .enum(["true", "false"])
        .transform((value) => value === "true")
        .optional(),
    sortBy: z
        .enum(["name", "employeeCode", "createdAt", "updatedAt"])
        .default("createdAt"),
    sortOrder: z
        .enum(["asc", "desc"])
        .default("desc"),
});

export const technicianStatusSchema = z.object({
    isActive: z.boolean(),
});