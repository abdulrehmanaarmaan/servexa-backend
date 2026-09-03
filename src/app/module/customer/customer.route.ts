import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest.js";
import { UserRole } from "../../../generated/prisma/enums.js";
import { auth } from "../../middleware/checkAuth.js";
import { customerController } from "./customer.controller.js";
import { customerValidation } from "./customer.validation.js";

const router = Router();

router.get(
    "/me",
    auth(UserRole.CUSTOMER),
    customerController.getMyCustomerProfile,
);

router.patch(
    "/me",
    auth(UserRole.CUSTOMER),
    validateRequest({
        body:customerValidation.updateCustomerSchema
    }),
    customerController.updateMyCustomerProfile,
);

export const customerRoutes = router;
