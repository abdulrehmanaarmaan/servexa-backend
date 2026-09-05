import { z } from "zod";

export const adminUserParamsSchema = z.object({
    userId: z.string().uuid(),
});

export const adminTechnicianParamsSchema = z.object({
    technicianId: z.string().uuid(),
});

export const adminUserQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    role: z
        .enum(["CUSTOMER", "TECHNICIAN", "ADMIN"])
        .optional(),
    isActive: z
        .enum(["true", "false"])
        .transform((value) => value === "true")
        .optional(),
    search: z.string().trim().max(100).optional(),
});

export const adminStatusSchema = z.object({
    isActive: z.boolean(),
});

export const adminAuditLogQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    entity: z.string().trim().max(100).optional(),
    entityId: z.string().uuid().optional(),
    actorId: z.string().uuid().optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(["CUSTOMER", "TECHNICIAN"]),
});

export const userIdParamsSchema = z.object({
  userId: z.string().uuid(),
});