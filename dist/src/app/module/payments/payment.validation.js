import { z } from "zod";
export const createPaymentSchema = z
    .object({
    provider: z.enum(["BKASH"]),
})
    .strict();
export const invoicePaymentParamsSchema = z.object({
    invoiceId: z.uuid(),
});
