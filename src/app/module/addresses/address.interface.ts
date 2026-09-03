import { z } from "zod";

import {
  createAddressSchema,
  updateAddressSchema,
} from "./address.validation.js";

export type ICreateAddressPayload = z.infer<
  typeof createAddressSchema
>;

export type IUpdateAddressPayload = z.infer<
  typeof updateAddressSchema
>;