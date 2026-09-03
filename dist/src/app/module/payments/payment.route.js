import { Router } from "express";
import { paymentController } from "./payment.controller.js";
import { auth } from "../../middleware/checkAuth.js";
import { UserRole } from "../../../generated/prisma/enums.js";
import { createPaymentSchema, invoicePaymentParamsSchema } from "./payment.validation.js";
import { validateRequest } from "../../middleware/validateRequest.js";
const router = Router();
router.post("/invoices/:invoiceId/payments", auth(UserRole.CUSTOMER), validateRequest({
    params: invoicePaymentParamsSchema,
    body: createPaymentSchema,
}), paymentController.createPayment);
router.get("/payments/bkash/callback", paymentController.bkashCallback);
export const paymentRoutes = router;
