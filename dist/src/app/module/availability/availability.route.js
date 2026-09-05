import { Router } from "express";
import { availabilityController } from "./availability.controller.js";
import { createAvailabilitySchema, availabilityParamsSchema, updateAvailabilitySchema, } from "./availability.validation.js";
import { auth } from "../../middleware/checkAuth.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { UserRole } from "../../../generated/prisma/enums.js";
const router = Router();
router.get("/technicians/me", auth(UserRole.TECHNICIAN), availabilityController.getMyAvailabilities);
router.post("/", auth(UserRole.TECHNICIAN), validateRequest({
    body: createAvailabilitySchema,
}), availabilityController.createAvailability);
router.patch("/:availabilityId/technicians/me", auth(UserRole.TECHNICIAN), validateRequest({
    params: availabilityParamsSchema,
    body: updateAvailabilitySchema,
}), availabilityController.updateAvailability);
router.delete("/:availabilityId/technicians/me", auth(UserRole.TECHNICIAN), validateRequest({
    params: availabilityParamsSchema,
}), availabilityController.deleteAvailability);
export const availabilityRoutes = router;
