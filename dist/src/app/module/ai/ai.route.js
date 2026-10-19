import { Router } from "express";
import rateLimit from "express-rate-limit";
import { UserRole } from "../../../generated/prisma/enums.js";
import { auth } from "../../middleware/checkAuth.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { aiController } from "./ai.controller.js";
import { serviceAssistantSchema, serviceRequestHelperSchema, } from "./ai.validation.js";
const router = Router();
const serviceAssistantLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        statusCode: 429,
        message: "Too many AI assistant requests. Please wait before trying again.",
    },
});
const serviceRequestHelperLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        statusCode: 429,
        message: "Too many AI helper requests. Please wait before trying again.",
    },
});
// PUBLIC: information about Servexa and its active services.
router.post("/service-assistant", serviceAssistantLimiter, validateRequest({
    body: serviceAssistantSchema,
}), aiController.serviceAssistant);
// CUSTOMER ONLY: help with the description of their own request.
// This endpoint does not create or modify a service request.
router.post("/service-request-helper", auth(UserRole.CUSTOMER), serviceRequestHelperLimiter, validateRequest({
    body: serviceRequestHelperSchema,
}), aiController.helpWithServiceRequest);
export const aiRoutes = router;
