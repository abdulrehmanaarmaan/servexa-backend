import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums.js";
import { auth } from "../../middleware/checkAuth.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { createInvoiceParamsSchema, createInvoiceSchema, invoiceParamsSchema, invoiceQuerySchema, updateInvoiceParamsSchema, updateInvoiceSchema } from "./invoice.validation.js";
import { invoiceController } from "./invoice.controller.js";
const router = Router();
router.post("/work-orders/:workOrderId", auth(UserRole.ADMIN), validateRequest({
    params: createInvoiceParamsSchema,
    body: createInvoiceSchema,
}), invoiceController.createInvoice);
router.get("/:invoiceId", auth(UserRole.ADMIN, UserRole.CUSTOMER), validateRequest({
    params: invoiceParamsSchema,
}), invoiceController.getInvoice);
router.get("/customers/me", auth(UserRole.CUSTOMER), validateRequest({
    query: invoiceQuerySchema,
}), invoiceController.getMyInvoices);
router.get("/", auth(UserRole.ADMIN), validateRequest({
    query: invoiceQuerySchema,
}), invoiceController.getAllInvoices);
router.patch("/admin/:invoiceId", auth(UserRole.ADMIN), validateRequest({
    params: updateInvoiceParamsSchema,
    body: updateInvoiceSchema,
}), invoiceController.updateInvoice);
export const invoiceRoutes = router;
