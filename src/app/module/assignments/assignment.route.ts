import { Router } from "express";

import { assignmentController } from "./assignment.controller.js";
import {
    workOrderAssignmentParamsSchema,
    assignmentParamsSchema,
    createAssignmentSchema,
} from "./assignment.validation.js";

import { auth } from "../../middleware/checkAuth.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { UserRole } from "../../../generated/prisma/enums.js";

const router = Router();

router.get(
    "/work-orders/:workOrderId/assignments",
    auth(UserRole.ADMIN, UserRole.TECHNICIAN),
    validateRequest({
        params: workOrderAssignmentParamsSchema,
    }),
    assignmentController.getAssignments,
);

router.post(
    "/work-orders/:workOrderId/assignments",
    auth(UserRole.ADMIN),
    validateRequest({
        params: workOrderAssignmentParamsSchema,
        body: createAssignmentSchema,
    }),
    assignmentController.createAssignment,
);

router.delete(
    "/work-orders/:workOrderId/assignments/:assignmentId",
    auth(UserRole.ADMIN),
    validateRequest({
        params: assignmentParamsSchema,
    }),
    assignmentController.unassignTechnician,
);

export const assignmentRoutes = router;