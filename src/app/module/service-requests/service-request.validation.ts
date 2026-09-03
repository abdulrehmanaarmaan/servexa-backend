import { z } from "zod";

export const createServiceRequestSchema = z.object({
  serviceId: z.string().uuid(),

  addressId: z.string().uuid(),

  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(
      2000,
      "Description cannot exceed 2000 characters",
    ),

  priority: z
    .enum([
      "LOW",
      "NORMAL",
      "HIGH",
      "URGENT",
    ])
    .default("NORMAL"),
});

export const serviceRequestParamsSchema = z.object({
  serviceRequestId: z.string().uuid(),
});

export const updateServiceRequestSchema = z
  .object({
    serviceId: z.string().uuid().optional(),

    addressId: z.string().uuid().optional(),

    description: z
      .string()
      .trim()
      .min(
        10,
        "Description must be at least 10 characters",
      )
      .max(
        2000,
        "Description cannot exceed 2000 characters",
      )
      .optional(),

    priority: z
      .enum([
        "LOW",
        "NORMAL",
        "HIGH",
        "URGENT",
      ])
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field must be provided",
    },
  );

export const updateServiceRequestStatusSchema =
  z.object({
    status: z.enum([
      "PENDING",
      "REVIEWED",
      "APPROVED",
      "REJECTED",
      "CONVERTED",
      "CANCELLED",
    ]),

    reason: z
      .string()
      .trim()
      .max(
        500,
        "Reason cannot exceed 500 characters",
      )
      .optional(),
  });

export const serviceRequestQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(10),

  status: z
    .enum([
      "PENDING",
      "REVIEWED",
      "APPROVED",
      "REJECTED",
      "CONVERTED",
      "CANCELLED",
    ])
    .optional(),

  priority: z
    .enum([
      "LOW",
      "NORMAL",
      "HIGH",
      "URGENT",
    ])
    .optional(),

  sortBy: z
    .enum([
      "createdAt",
      "updatedAt",
      "priority",
    ])
    .default("createdAt"),

  sortOrder: z
    .enum(["asc", "desc"])
    .default("desc"),
});