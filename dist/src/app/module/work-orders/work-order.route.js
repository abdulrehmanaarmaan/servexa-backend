import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums.js";
import { auth } from "../../middleware/checkAuth.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { createWorkOrderParamsSchema, createWorkOrderSchema, scheduleWorkOrderSchema, updateWorkOrderSchema, updateWorkOrderStatusSchema, workOrderParamsSchema, workOrderQuerySchema } from "./work-order.validation.js";
import { workOrderController } from "./work-order.controller.js";
const router = Router();
/*
 * ADMIN
 *
 * Convert an approved service request
 * into a work order.
 */
router.post("/service-requests/:serviceRequestId", auth(UserRole.ADMIN), validateRequest({
    params: createWorkOrderParamsSchema,
    body: createWorkOrderSchema,
}), workOrderController.createWorkOrder);
/*
 * CUSTOMER
 *
 * Get own work orders.
 *
 * Must appear before "/:workOrderId".
 */
router.get("/customers/me", auth(UserRole.CUSTOMER), validateRequest({
    query: workOrderQuerySchema,
}), workOrderController.getMyWorkOrders);
/*
 * TECHNICIAN
 *
 * Get assigned work orders.
 *
 * Must appear before "/:workOrderId".
 */
router.get("/technicians/me", auth(UserRole.TECHNICIAN), validateRequest({
    query: workOrderQuerySchema,
}), workOrderController.getMyTechnicianWorkOrders);
/*
 * ADMIN
 *
 * Get all work orders.
 */
router.get("/", auth(UserRole.ADMIN), validateRequest({
    query: workOrderQuerySchema,
}), workOrderController.getAllWorkOrders);
/*
 * ADMIN / CUSTOMER / TECHNICIAN
 *
 * Dynamic route comes AFTER all static routes.
 */
router.get("/:workOrderId", auth(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.TECHNICIAN), validateRequest({
    params: workOrderParamsSchema,
}), workOrderController.getWorkOrder);
/*
 * ADMIN
 */
router.patch("/:workOrderId", auth(UserRole.ADMIN), validateRequest({
    params: workOrderParamsSchema,
    body: updateWorkOrderSchema,
}), workOrderController.updateWorkOrder);
/*
 * ADMIN / TECHNICIAN
 */
router.patch("/:workOrderId/status", auth(UserRole.ADMIN, UserRole.TECHNICIAN), validateRequest({
    params: workOrderParamsSchema,
    body: updateWorkOrderStatusSchema,
}), workOrderController.updateWorkOrderStatus);
/*
 * ADMIN
 */
router.patch("/:workOrderId/schedule", auth(UserRole.ADMIN), validateRequest({
    params: workOrderParamsSchema,
    body: scheduleWorkOrderSchema,
}), workOrderController.scheduleWorkOrder);
export const workOrderRoutes = router;
