import type { z } from "zod";

import {
    notificationParamsSchema,
    notificationQuerySchema,
} from "./notification.validation.js";

export type INotificationParams = z.infer<
    typeof notificationParamsSchema
>;

export type INotificationQuery = z.infer<
    typeof notificationQuerySchema
>;