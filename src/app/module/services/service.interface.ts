import { z } from "zod";

import {
  createServiceSchema,
  serviceQuerySchema,
  updateServiceSchema,
} from "./service.validation.js";

export type ICreateServicePayload = z.infer<
  typeof createServiceSchema
>;

export type IUpdateServicePayload = z.infer<
  typeof updateServiceSchema
>;

export type IServiceQuery = z.infer<
  typeof serviceQuerySchema
>;