import { Router } from "express";

import { noteController } from "./note.controller.js";
import {
    workOrderNoteParamsSchema,
    noteParamsSchema,
    createNoteSchema,
    updateNoteSchema,
} from "./note.validation.js";

import { auth } from "../../middleware/checkAuth.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { UserRole } from "../../../generated/prisma/enums.js";

const router = Router();

router.get(
    "/work-orders/:workOrderId/notes",
    auth(
        UserRole.ADMIN,
        UserRole.CUSTOMER,
        UserRole.TECHNICIAN,
    ),
    validateRequest({
        params: workOrderNoteParamsSchema,
    }),
    noteController.getNotes,
);

router.post(
    "/work-orders/:workOrderId/notes",
    auth(
        UserRole.ADMIN,
        UserRole.CUSTOMER,
        UserRole.TECHNICIAN,
    ),
    validateRequest({
        params: workOrderNoteParamsSchema,
        body: createNoteSchema,
    }),
    noteController.createNote,
);

router.patch(
    "/work-orders/:workOrderId/notes/:noteId",
    auth(
        UserRole.ADMIN,
        UserRole.CUSTOMER,
        UserRole.TECHNICIAN,
    ),
    validateRequest({
        params: noteParamsSchema,
        body: updateNoteSchema,
    }),
    noteController.updateNote,
);

router.delete(
    "/work-orders/:workOrderId/notes/:noteId",
    auth(
        UserRole.ADMIN,
        UserRole.CUSTOMER,
        UserRole.TECHNICIAN,
    ),
    validateRequest({
        params: noteParamsSchema,
    }),
    noteController.deleteNote,
);

export const noteRoutes = router;