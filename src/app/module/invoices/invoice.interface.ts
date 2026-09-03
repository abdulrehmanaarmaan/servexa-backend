import { z } from "zod";
import {
  createInvoiceSchema,
  invoiceParamsSchema,
  invoiceQuerySchema,
  updateInvoiceParamsSchema,
  updateInvoiceSchema,
} from "./invoice.validation.js";

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;

export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;

export type InvoiceParams = z.infer<typeof invoiceParamsSchema>;

export type UpdateInvoiceParams = z.infer<
  typeof updateInvoiceParamsSchema
>;

export type InvoiceQuery = z.infer<typeof invoiceQuerySchema>;