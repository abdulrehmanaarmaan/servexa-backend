import { Router } from "express";

import { UserRole } from "../../../generated/prisma/enums.js";

import { auth } from "../../middleware/checkAuth.js";
import { validateRequest } from "../../middleware/validateRequest.js";

import {
    createWorkOrderParamsSchema,
    createWorkOrderSchema,
    scheduleWorkOrderSchema,
    updateWorkOrderSchema,
    updateWorkOrderStatusSchema,
    workOrderParamsSchema,
    workOrderQuerySchema 

} from "./work-order.validation.js";
import { workOrderController } from "./work-order.controller.js";

const router = Router();

/*
 * ADMIN
 *
 * Convert an approved service request
 * into a work order.
 */
router.post(
    "/service-requests/:serviceRequestId/work-order",

    auth(UserRole.ADMIN),

    validateRequest({
        params: createWorkOrderParamsSchema,
        body: createWorkOrderSchema,
    }),

    workOrderController.createWorkOrder,
);

/*
 * ADMIN / CUSTOMER / TECHNICIAN
 *
 * Object-level authorization is performed
 * inside the service.
 */
router.get(
    "/work-orders/:workOrderId",

    auth(
        UserRole.ADMIN,
        UserRole.CUSTOMER,
        UserRole.TECHNICIAN,
    ),

    validateRequest({
        params: workOrderParamsSchema,
    }),

    workOrderController.getWorkOrder,
);

/*
 * CUSTOMER
 *
 * Get own work orders.
 */
router.get(
    "/customers/me/work-orders",

    auth(UserRole.CUSTOMER),

    validateRequest({
        query: workOrderQuerySchema,
    }),

    workOrderController.getMyWorkOrders,
);

/*
 * TECHNICIAN
 *
 * Get assigned work orders.
 */
router.get(
    "/technicians/me/work-orders",

    auth(UserRole.TECHNICIAN),

    validateRequest({
        query: workOrderQuerySchema,
    }),

    workOrderController.getMyTechnicianWorkOrders,
);

/*
 * ADMIN
 *
 * Get all work orders.
 */
router.get(
    "/admin/work-orders",

    auth(UserRole.ADMIN),

    validateRequest({
        query: workOrderQuerySchema,
    }),

    workOrderController.getAllWorkOrders,
);

/*
 * ADMIN
 *
 * Update editable work-order information.
 */
router.patch(
    "/work-orders/:workOrderId",

    auth(UserRole.ADMIN),

    validateRequest({
        params: workOrderParamsSchema,
        body: updateWorkOrderSchema,
    }),

    workOrderController.updateWorkOrder,
);

/*
 * ADMIN / TECHNICIAN
 *
 * Change work-order status.
 *
 * The service applies additional object-level
 * and transition rules.
 */
router.patch(
    "/work-orders/:workOrderId/status",

    auth(
        UserRole.ADMIN,
        UserRole.TECHNICIAN,
    ),

    validateRequest({
        params: workOrderParamsSchema,
        body: updateWorkOrderStatusSchema,
    }),

    workOrderController.updateWorkOrderStatus,
);

/*
 * ADMIN
 *
 * Schedule a work order.
 */
router.patch(
    "/work-orders/:workOrderId/schedule",

    auth(UserRole.ADMIN),

    validateRequest({
        params: workOrderParamsSchema,
        body: scheduleWorkOrderSchema,
    }),

    workOrderController.scheduleWorkOrder,
);

export const workOrderRoutes = router;