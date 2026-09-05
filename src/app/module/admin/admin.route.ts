import { Router } from "express";

import { adminController } from "./admin.controller.js";
import {
    adminUserParamsSchema,
    adminTechnicianParamsSchema,
    adminUserQuerySchema,
    adminStatusSchema,
    adminAuditLogQuerySchema,
    userIdParamsSchema,
    updateUserRoleSchema,
} from "./admin.validation.js";

import { auth } from "../../middleware/checkAuth.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { UserRole } from "../../../generated/prisma/enums.js";

const router = Router();

router.get(
    "/dashboard",
    auth(UserRole.ADMIN),
    adminController.getDashboard,
);

router.get(
    "/users",
    auth(UserRole.ADMIN),
    validateRequest({
        query: adminUserQuerySchema,
    }),
    adminController.getUsers,
);

router.patch(
    "/users/:userId/status",
    auth(UserRole.ADMIN),
    validateRequest({
        params: adminUserParamsSchema,
        body: adminStatusSchema,
    }),
    adminController.updateUserStatus,
);

router.get(
    "/technicians",
    auth(UserRole.ADMIN),
    adminController.getTechnicians,
);

router.patch(
    "/technicians/:technicianId/status",
    auth(UserRole.ADMIN),
    validateRequest({
        params: adminTechnicianParamsSchema,
        body: adminStatusSchema,
    }),
    adminController.updateTechnicianStatus,
);

router.get(
    "/payments",
    auth(UserRole.ADMIN),
    adminController.getPayments,
);

router.get(
    "/audit-logs",
    auth(UserRole.ADMIN),
    validateRequest({
        query: adminAuditLogQuerySchema,
    }),
    adminController.getAuditLogs,
);

router.patch(
  "/users/:userId/role",
  auth(UserRole.ADMIN),
  validateRequest({
    params: userIdParamsSchema,
    body: updateUserRoleSchema,
  }),
  adminController.updateUserRole,
);


export const adminRoutes = router;