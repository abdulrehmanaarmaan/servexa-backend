import z from "zod";

const updateCustomerSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().min(7).max(20).optional(),
  company: z.string().trim().max(150).optional(),
}).strict();

export const customerValidation = {
  updateCustomerSchema
}