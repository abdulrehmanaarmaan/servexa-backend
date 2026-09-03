import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums.js";
import { auth } from "../../middleware/checkAuth.js";

import { validateRequest } from "../../middleware/validateRequest.js";
import { createInvoiceParamsSchema, createInvoiceSchema, invoiceParamsSchema, invoiceQuerySchema, updateInvoiceParamsSchema, updateInvoiceSchema } from "./invoice.validation.js";
import { invoiceController } from "./invoice.controller.js";

const router = Router();

router.post(
  "/work-orders/:workOrderId/invoice",
  auth(UserRole.ADMIN),
  validateRequest({
    params: createInvoiceParamsSchema,
    body: createInvoiceSchema,
  }),
  invoiceController.createInvoice,
);

router.get(
  "/invoices/:invoiceId",
  auth(UserRole.ADMIN, UserRole.CUSTOMER),
  validateRequest({
    params: invoiceParamsSchema,
  }),
  invoiceController.getInvoice,
);

// router.get(
//   "/customers/me/invoices",
//   auth(UserRole.CUSTOMER),
//   validateRequest({
//     query: invoiceQuerySchema,
//   }),
//   invoiceController.getMyInvoices,
// );

// router.get(
//   "/admin/invoices",
//   auth(UserRole.ADMIN),
//   validateRequest({
//     query: invoiceQuerySchema,
//   }),
//   invoiceController.getAllInvoices,
// );

router.patch(
  "/admin/invoices/:invoiceId",
  auth(UserRole.ADMIN),
  validateRequest({
    params: updateInvoiceParamsSchema,
    body: updateInvoiceSchema,
  }),
  invoiceController.updateInvoice,
);

export const invoiceRoutes = router;
