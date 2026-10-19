import { z } from "zod";

export const serviceAssistantSchema = z.object({
  question: z
    .string()
    .trim()
    .min(3, "Please enter a more detailed question.")
    .max(500, "Question cannot exceed 500 characters."),
});

export const serviceRequestHelperSchema = z.object({
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters.")
    .max(2000, "Description cannot exceed 2000 characters."),
});

export type ServiceAssistantInput = z.infer<
  typeof serviceAssistantSchema
>;

export type ServiceRequestHelperInput = z.infer<
  typeof serviceRequestHelperSchema
>;