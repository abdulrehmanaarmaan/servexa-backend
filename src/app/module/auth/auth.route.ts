import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { AuthController } from "./auth.controller";
import { authValidation } from "./auth.validation";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post(
	"/register",
	validateRequest(authValidation.registerSchema),
	AuthController.registerPatient,
);

router.post(
	"/login",
	validateRequest(authValidation.loginSchema),
	AuthController.loginUser,
);

router.get(
	"/me",
	auth(UserRole.ADMIN, UserRole.STAFF, UserRole.TECHNICIAN, UserRole.CUSTOMER),
	AuthController.getMe,
);

router.post("/refresh-token", AuthController.refreshToken);

router.post("/google", AuthController.googleLogin);

export const AuthRoutes = router;
