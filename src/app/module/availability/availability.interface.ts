import type { z } from "zod";

import {
    createAvailabilitySchema,
    availabilityParamsSchema,
    updateAvailabilitySchema,
} from "./availability.validation.js";

export type ICreateAvailability = z.infer<
    typeof createAvailabilitySchema
>;

export type IUpdateAvailability = z.infer<
    typeof updateAvailabilitySchema
>;

export type IAvailabilityParams = z.infer<
    typeof availabilityParamsSchema
>;