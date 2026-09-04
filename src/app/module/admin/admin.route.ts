import { Router } from "express";

import { adminController } from "./admin.controller.js";
import {
    adminUserParamsSchema,
    adminTechnicianParamsSchema,
    adminUserQuerySchema,
    adminStatusSchema,
    adminAuditLogQuerySchema,
} from "./admin.validation.js";

import { auth } from "../../middleware/checkAuth.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { UserRole } from "../../../generated/prisma/enums.js";

const router = Router();

router.get(
    "/admin/dashboard",
    auth(UserRole.ADMIN),
    adminController.getDashboard,
);

router.get(
    "/admin/users",
    auth(UserRole.ADMIN),
    validateRequest({
        query: adminUserQuerySchema,
    }),
    adminController.getUsers,
);

router.patch(
    "/admin/users/:userId/status",
    auth(UserRole.ADMIN),
    validateRequest({
        params: adminUserParamsSchema,
        body: adminStatusSchema,
    }),
    adminController.updateUserStatus,
);

router.get(
    "/admin/technicians",
    auth(UserRole.ADMIN),
    adminController.getTechnicians,
);

router.patch(
    "/admin/technicians/:technicianId/status",
    auth(UserRole.ADMIN),
    validateRequest({
        params: adminTechnicianParamsSchema,
        body: adminStatusSchema,
    }),
    adminController.updateTechnicianStatus,
);

router.get(
    "/admin/payments",
    auth(UserRole.ADMIN),
    adminController.getPayments,
);

router.get(
    "/admin/audit-logs",
    auth(UserRole.ADMIN),
    validateRequest({
        query: adminAuditLogQuerySchema,
    }),
    adminController.getAuditLogs,
);

export const adminRoutes = router;