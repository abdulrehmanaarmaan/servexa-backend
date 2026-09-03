import { z } from "zod";

export const createServiceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Service name must be at least 2 characters")
    .max(100, "Service name cannot exceed 100 characters"),

  description: z
    .string()
    .trim()
    .max(2000, "Description cannot exceed 2000 characters")
    .optional(),

  basePrice: z.coerce
    .number()
    .nonnegative("Base price cannot be negative")
    .finite("Base price must be a valid number"),
});

export const serviceParamsSchema = z.object({
  serviceId: z.string().uuid(),
});

export const updateServiceSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Service name must be at least 2 characters")
      .max(100, "Service name cannot exceed 100 characters")
      .optional(),

    description: z
      .string()
      .trim()
      .max(2000, "Description cannot exceed 2000 characters")
      .optional(),

    basePrice: z.coerce
      .number()
      .nonnegative("Base price cannot be negative")
      .finite("Base price must be a valid number")
      .optional(),

    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const serviceQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(10),

  search: z
    .string()
    .trim()
    .max(100)
    .optional(),

  isActive: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),

  sortBy: z
    .enum(["name", "basePrice", "createdAt", "updatedAt"])
    .default("createdAt"),

  sortOrder: z
    .enum(["asc", "desc"])
    .default("desc"),
});