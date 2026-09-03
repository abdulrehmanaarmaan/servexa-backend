import { z } from "zod";

import {
  createServiceRequestSchema,
  serviceRequestQuerySchema,
  updateServiceRequestSchema,
  updateServiceRequestStatusSchema,
} from "./service-request.validation.js";

export type ICreateServiceRequestPayload =
  z.infer<
    typeof createServiceRequestSchema
  >;

export type IUpdateServiceRequestPayload =
  z.infer<
    typeof updateServiceRequestSchema
  >;

export type IUpdateServiceRequestStatusPayload =
  z.infer<
    typeof updateServiceRequestStatusSchema
  >;

export type IServiceRequestQuery =
  z.infer<
    typeof serviceRequestQuerySchema
  >;