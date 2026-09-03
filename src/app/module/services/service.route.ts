import { Router } from "express";

import { UserRole } from "../../../generated/prisma/enums.js";

import { auth } from "../../middleware/checkAuth.js";
import { validateRequest } from "../../middleware/validateRequest.js";

import { serviceController } from "./service.controller.js";

import {
  createServiceSchema,
  serviceParamsSchema,
  serviceQuerySchema,
  updateServiceSchema,
} from "./service.validation.js";

const router = Router();


// Public service listing
router.get(
  "/",
  validateRequest({
    query: serviceQuerySchema,
  }),
  serviceController.getAllServices,
);


// Public single service
router.get(
  "/:serviceId",
  validateRequest({
    params: serviceParamsSchema,
  }),
  serviceController.getServiceById,
);


// Admin creates service
router.post(
  "/",
  auth(UserRole.ADMIN),
  validateRequest({
    body: createServiceSchema,
  }),
  serviceController.createService,
);


// Admin updates service
router.patch(
  "/:serviceId",
  auth(UserRole.ADMIN),
  validateRequest({
    params: serviceParamsSchema,
    body: updateServiceSchema,
  }),
  serviceController.updateService,
);


// Admin soft deletes service
router.delete(
  "/:serviceId",
  auth(UserRole.ADMIN),
  validateRequest({
    params: serviceParamsSchema,
  }),
  serviceController.deleteService,
);


export const serviceRoutes = router;