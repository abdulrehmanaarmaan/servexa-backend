import type { z } from "zod";

import {
    notificationParamsSchema,
    notificationQuerySchema,
} from "./notification.validation.js";
import { NotificationType } from "../../../generated/prisma/enums.js";

export interface ICreateNotification {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
}

export type INotificationParams = z.infer<
    typeof notificationParamsSchema
>;

export type INotificationQuery = z.infer<
    typeof notificationQuerySchema
>;