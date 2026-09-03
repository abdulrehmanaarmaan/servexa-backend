import { z } from "zod";

import type { IRequestUser } from "../auth/auth.interface.js";

import {
  createWorkOrderSchema,
  scheduleWorkOrderSchema,
  updateWorkOrderSchema,
  updateWorkOrderStatusSchema,
  workOrderQuerySchema,
} from "./work-order.validation.js";

export type ICreateWorkOrderPayload = z.infer<
  typeof createWorkOrderSchema
>;

export type IUpdateWorkOrderPayload = z.infer<
  typeof updateWorkOrderSchema
>;

export type IUpdateWorkOrderStatusPayload = z.infer<
  typeof updateWorkOrderStatusSchema
>;

export type IScheduleWorkOrderPayload = z.infer<
  typeof scheduleWorkOrderSchema
>;

export type IWorkOrderQuery = z.infer<
  typeof workOrderQuerySchema
>;

export interface IWorkOrderServiceContext {
  user: IRequestUser;
}