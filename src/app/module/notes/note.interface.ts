import { Router } from "express";

import { availabilityController } from "./availability.controller.js";
import {
    createAvailabilitySchema,
    availabilityParamsSchema,
    updateAvailabilitySchema,
} from "./availability.validation.js";

import { auth } from "../../middleware/checkAuth.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { UserRole } from "../../../generated/prisma/enums.js";

const router = Router();

router.get(
    "/technicians/me/availabilities",
    auth(UserRole.TECHNICIAN),
    availabilityController.getMyAvailabilities,
);

router.post(
    "/technicians/me/availabilities",
    auth(UserRole.TECHNICIAN),
    validateRequest({
        body: createAvailabilitySchema,
    }),
    availabilityController.createAvailability,
);

router.patch(
    "/technicians/me/availabilities/:availabilityId",
    auth(UserRole.TECHNICIAN),
    validateRequest({
        params: availabilityParamsSchema,
        body: updateAvailabilitySchema,
    }),
    availabilityController.updateAvailability,
);

router.delete(
    "/technicians/me/availabilities/:availabilityId",
    auth(UserRole.TECHNICIAN),
    validateRequest({
        params: availabilityParamsSchema,
    }),
    availabilityController.deleteAvailability,
);

export const availabilityRoutes = router;