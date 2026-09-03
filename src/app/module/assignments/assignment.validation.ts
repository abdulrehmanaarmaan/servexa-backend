import { z } from "zod";

export const workOrderAssignmentParamsSchema = z.object({
    workOrderId: z.string().uuid(),
});

export const assignmentParamsSchema = z.object({
    workOrderId: z.string().uuid(),
    assignmentId: z.string().uuid(),
});

export const createAssignmentSchema = z.object({
    technicianId: z.string().uuid(),
});