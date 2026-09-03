import z from "zod";
const registerSchema = z.object({
    name: z.string().trim().min(2).max(100),
    email: z.email(),
    password: z.string().min(8).max(72),
    phone: z.string().trim().min(7).max(20).optional(),
});
const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(1),
});
const refreshSchema = z.object({});
export const authValidation = {
    registerSchema,
    loginSchema,
    refreshSchema
};
