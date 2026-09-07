import { Router } from "express";
import { authValidation } from "./auth.validation.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { UserRole } from "../../../generated/prisma/enums.js";
import { auth } from "../../middleware/checkAuth.js";
import { authController } from "./auth.controller.js";

const router = Router();

router.post("/register",validateRequest({
	body:authValidation.registerSchema}),authController.registerCustomer);

router.post(
	"/login",
	validateRequest({
		body:authValidation.loginSchema
	}),
	authController.loginUser
);

router.get(
	"/me",
	auth(UserRole.ADMIN, UserRole.TECHNICIAN, UserRole.CUSTOMER),
	authController.getMe
);

router.post("/refresh-token", authController.refreshToken);

router.get("/google", authController.googleLogin);

router.get(
  "/google/callback",
  authController.googleCallback,
);

export const authRoutes = router;
