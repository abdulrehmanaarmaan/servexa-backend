import { Router } from "express";
import { UserRole } from "../../../generated/prisma/client.js";
import { addressController } from "./address.controller.js";
import { addressParamsSchema, createAddressSchema, updateAddressSchema } from "./address.validation.js";
import { auth } from "../../middleware/checkAuth.js";
import { validateRequest } from "../../middleware/validateRequest.js";
const router = Router();
router.post("/", auth(UserRole.CUSTOMER), validateRequest({
    body: createAddressSchema,
}), addressController.createAddress);
router.get("/", auth(UserRole.CUSTOMER), addressController.getMyAddresses);
router.get("/:addressId", auth(UserRole.CUSTOMER), validateRequest({
    params: addressParamsSchema,
}), addressController.getAddressById);
router.patch("/:addressId", auth(UserRole.CUSTOMER), validateRequest({
    params: addressParamsSchema,
    body: updateAddressSchema,
}), addressController.updateAddress);
router.delete("/:addressId", auth(UserRole.CUSTOMER), validateRequest({
    params: addressParamsSchema,
}), addressController.deleteAddress);
export const addressRoutes = router;
