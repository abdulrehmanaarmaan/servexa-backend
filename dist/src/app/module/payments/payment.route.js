import { Router } from "express";
import { auth } from "../../middleware/checkAuth.js";
import { UserRole } from "../../../generated/prisma/enums.js";
import { createPaymentSchema, invoicePaymentParamsSchema, } from "./payment.validation.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { paymentController } from "./payment.controller.js";
const router = Router();
router.get("/me", auth(UserRole.CUSTOMER), paymentController.getMyPayments);
router.post("/invoices/:invoiceId", auth(UserRole.CUSTOMER), validateRequest({
    params: invoicePaymentParamsSchema,
    body: createPaymentSchema,
}), paymentController.createPayment);
router.get("/bkash/callback", paymentController.bkashCallback);
export const paymentRoutes = router;
