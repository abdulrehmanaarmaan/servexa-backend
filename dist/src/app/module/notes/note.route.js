import { Router } from "express";
import { workOrderNoteParamsSchema, noteParamsSchema, createNoteSchema, updateNoteSchema, } from "./note.validation.js";
import { auth } from "../../middleware/checkAuth.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { UserRole } from "../../../generated/prisma/enums.js";
import { noteController } from "./note.controller.js";
const router = Router();
router.get("/:workOrderId", auth(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.TECHNICIAN), validateRequest({
    params: workOrderNoteParamsSchema,
}), noteController.getNotes);
router.post("/work-orders/:workOrderId", auth(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.TECHNICIAN), validateRequest({
    params: workOrderNoteParamsSchema,
    body: createNoteSchema,
}), noteController.createNote);
router.patch("/:noteId/work-orders/:workOrderId", auth(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.TECHNICIAN), validateRequest({
    params: noteParamsSchema,
    body: updateNoteSchema,
}), noteController.updateNote);
router.delete("/:noteId/work-orders/:workOrderId", auth(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.TECHNICIAN), validateRequest({
    params: noteParamsSchema,
}), noteController.deleteNote);
export const noteRoutes = router;
