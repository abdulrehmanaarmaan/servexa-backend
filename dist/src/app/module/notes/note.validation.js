import { z } from "zod";
export const workOrderNoteParamsSchema = z.object({
    workOrderId: z.string().uuid(),
});
export const noteParamsSchema = z.object({
    workOrderId: z.string().uuid(),
    noteId: z.string().uuid(),
});
export const createNoteSchema = z.object({
    content: z.string().trim().min(1).max(5000),
});
export const updateNoteSchema = z.object({
    content: z.string().trim().min(1).max(5000),
});
