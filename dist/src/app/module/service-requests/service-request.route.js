import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums.js";
import { auth } from "../../middleware/checkAuth.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { serviceRequestController, } from "./service-request.controller.js";
import { createServiceRequestSchema, serviceRequestParamsSchema, serviceRequestQuerySchema, updateServiceRequestSchema, updateServiceRequestStatusSchema, } from "./service-request.validation.js";
const router = Router();
/*
 * CUSTOMER
 *
 * Create a new service request.
 */
router.post("/", auth(UserRole.CUSTOMER), validateRequest({
    body: createServiceRequestSchema,
}), serviceRequestController.createServiceRequest);
/*
 * CUSTOMER / ADMIN
 *
 * Get one service request.
 *
 * Object-level authorization is handled
 * inside the service.
 */
router.get("/:serviceRequestId", auth(UserRole.CUSTOMER, UserRole.ADMIN), validateRequest({
    params: serviceRequestParamsSchema,
}), serviceRequestController.getServiceRequest);
/*
 * CUSTOMER
 *
 * Get own service requests.
 */
router.get("/me", auth(UserRole.CUSTOMER), validateRequest({
    query: serviceRequestQuerySchema,
}), serviceRequestController.getMyServiceRequests);
/*
 * ADMIN
 *
 * Get all service requests.
 */
router.get("/", auth(UserRole.ADMIN), validateRequest({
    query: serviceRequestQuerySchema,
}), serviceRequestController.getAllServiceRequests);
/*
 * CUSTOMER
 *
 * Update own pending request.
 */
router.patch("/:serviceRequestId", auth(UserRole.CUSTOMER), validateRequest({
    params: serviceRequestParamsSchema,
    body: updateServiceRequestSchema,
}), serviceRequestController.updateServiceRequest);
/*
 * ADMIN
 *
 * Review / approve / reject a request.
 */
router.patch("/:serviceRequestId/status", auth(UserRole.ADMIN), validateRequest({
    params: serviceRequestParamsSchema,
    body: updateServiceRequestStatusSchema,
}), serviceRequestController.updateServiceRequestStatus);
/*
 * CUSTOMER
 *
 * Cancel own request.
 */
router.post("/:serviceRequestId/cancel", auth(UserRole.CUSTOMER), validateRequest({
    params: serviceRequestParamsSchema,
}), serviceRequestController.cancelServiceRequest);
export const serviceRequestRoutes = router;
