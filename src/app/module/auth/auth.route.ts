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

router.post(
  "/google",
  validateRequest({
    body: authValidation.googleLoginSchema,
  }),
  authController.googleLogin,
);

router.post("/logout", authController.logoutUser);

export const authRoutes = router;
