import { z } from "zod";
export const createAddressSchema = z.object({
    label: z
        .string()
        .trim()
        .max(50, "Label cannot exceed 50 characters")
        .optional(),
    addressLine: z
        .string()
        .trim()
        .min(5, "Address must be at least 5 characters")
        .max(500, "Address cannot exceed 500 characters"),
    city: z
        .string()
        .trim()
        .min(2, "City must be at least 2 characters")
        .max(100, "City cannot exceed 100 characters"),
    state: z
        .string()
        .trim()
        .max(100, "State cannot exceed 100 characters")
        .optional(),
    postalCode: z
        .string()
        .trim()
        .max(20, "Postal code cannot exceed 20 characters")
        .optional(),
    country: z
        .string()
        .trim()
        .min(2, "Country must be at least 2 characters")
        .max(100, "Country cannot exceed 100 characters"),
    latitude: z.coerce
        .number()
        .min(-90)
        .max(90)
        .optional(),
    longitude: z.coerce
        .number()
        .min(-180)
        .max(180)
        .optional(),
});
export const addressParamsSchema = z.object({
    addressId: z.string().uuid(),
});
export const updateAddressSchema = z
    .object({
    label: z
        .string()
        .trim()
        .max(50, "Label cannot exceed 50 characters")
        .optional(),
    addressLine: z
        .string()
        .trim()
        .min(5, "Address must be at least 5 characters")
        .max(500, "Address cannot exceed 500 characters")
        .optional(),
    city: z
        .string()
        .trim()
        .min(2, "City must be at least 2 characters")
        .max(100, "City cannot exceed 100 characters")
        .optional(),
    state: z
        .string()
        .trim()
        .max(100, "State cannot exceed 100 characters")
        .optional(),
    postalCode: z
        .string()
        .trim()
        .max(20, "Postal code cannot exceed 20 characters")
        .optional(),
    country: z
        .string()
        .trim()
        .min(2, "Country must be at least 2 characters")
        .max(100)
        .optional(),
    latitude: z.coerce
        .number()
        .min(-90)
        .max(90)
        .optional(),
    longitude: z.coerce
        .number()
        .min(-180)
        .max(180)
        .optional(),
})
    .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
});
