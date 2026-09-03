import type { z } from "zod";
import {
    technicianParamsSchema,
    updateTechnicianSchema,
    technicianQuerySchema,
} from "./technician.validation.js";

export type ITechnicianParams = z.infer<
    typeof technicianParamsSchema
>;

export type IUpdateTechnician = z.infer<
    typeof updateTechnicianSchema
>;

export type ITechnicianQuery = z.infer<
    typeof technicianQuerySchema
>;