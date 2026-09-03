import { Router } from "express";

import { technicianController } from "./technician.controller.js";
import {
    technicianParamsSchema,
    technicianQuerySchema,
    technicianStatusSchema,
    updateTechnicianSchema,
} from "./technician.validation.js";

import { auth } from "../../middleware/checkAuth.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { UserRole } from "../../../generated/prisma/enums.js";

const router = Router();

router.get(
    "/technicians",
    auth(UserRole.ADMIN),
    validateRequest({
        query: technicianQuerySchema,
    }),
    technicianController.getAllTechnicians,
);

router.get(
    "/technicians/:technicianId",
    auth(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.TECHNICIAN),
    validateRequest({
        params: technicianParamsSchema,
    }),
    technicianController.getTechnicianById,
);

router.get(
    "/technicians/me",
    auth(UserRole.TECHNICIAN),
    technicianController.getMyTechnicianProfile,
);

router.patch(
    "/technicians/me",
    auth(UserRole.TECHNICIAN),
    validateRequest({
        body: updateTechnicianSchema,
    }),
    technicianController.updateMyTechnicianProfile,
);

router.patch(
    "/admin/technicians/:technicianId/status",
    auth(UserRole.ADMIN),
    validateRequest({
        params: technicianParamsSchema,
        body: technicianStatusSchema,
    }),
    technicianController.updateTechnicianStatus,
);

export const technicianRoutes = router;