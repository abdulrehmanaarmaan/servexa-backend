import { z } from "zod";

const moneySchema = z
  .coerce
  .number()
  .nonnegative()
  .refine(
    (value) => Number.isInteger(value * 100),
    "Amount can have at most 2 decimal places",
  );

export const createInvoiceParamsSchema = z.object({
  workOrderId: z.string().uuid(),
});

export const createInvoiceSchema = z.object({
  subtotal: moneySchema.refine(
    (value) => value > 0,
    "Subtotal must be greater than 0",
  ),

  tax: moneySchema.default(0),

  dueAt: z.coerce.date().optional(),
});

export const invoiceParamsSchema = z.object({
  invoiceId: z.string().uuid(),
});

export const updateInvoiceParamsSchema = z.object({
  invoiceId: z.string().uuid(),
});

export const updateInvoiceSchema = z
  .object({
    tax: moneySchema.optional(),

    dueAt: z.coerce.date().nullable().optional(),
  })
  .refine(
    (data) =>
      data.tax !== undefined ||
      data.dueAt !== undefined,
    {
      message: "At least one field must be provided",
    },
  );

export const invoiceQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(10),

  status: z
    .enum([
      "ISSUED",
      "PARTIALLY_PAID",
      "PAID",
      "OVERDUE",
      "VOID",
    ])
    .optional(),

  sortBy: z
    .enum([
      "createdAt",
      "issuedAt",
      "dueAt",
      "total",
    ])
    .default("createdAt"),

  sortOrder: z
    .enum(["asc", "desc"])
    .default("desc"),
});