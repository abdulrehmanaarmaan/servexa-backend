import type { z } from "zod";

import {
    assignmentParamsSchema,
    createAssignmentSchema,
} from "./assignment.validation.js";

export type ICreateAssignment = z.infer<
    typeof createAssignmentSchema
>;

export type IAssignmentParams = z.infer<
    typeof assignmentParamsSchema
>;