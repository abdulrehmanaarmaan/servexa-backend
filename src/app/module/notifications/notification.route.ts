import { Router } from "express";

import { notificationController } from "./notification.controller.js";
import {
    notificationParamsSchema,
    notificationQuerySchema,
} from "./notification.validation.js";

import { auth } from "../../middleware/checkAuth.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { UserRole } from "../../../generated/prisma/enums.js";

const router = Router();

router.get(
    "/notifications",
    auth(
        UserRole.ADMIN,
        UserRole.CUSTOMER,
        UserRole.TECHNICIAN,
    ),
    validateRequest({
        query: notificationQuerySchema,
    }),
    notificationController.getMyNotifications,
);

router.patch(
    "/notifications/:notificationId/read",
    auth(
        UserRole.ADMIN,
        UserRole.CUSTOMER,
        UserRole.TECHNICIAN,
    ),
    validateRequest({
        params: notificationParamsSchema,
    }),
    notificationController.markAsRead,
);

router.patch(
    "/notifications/read-all",
    auth(
        UserRole.ADMIN,
        UserRole.CUSTOMER,
        UserRole.TECHNICIAN,
    ),
    notificationController.markAllAsRead,
);

export const notificationRoutes = router;