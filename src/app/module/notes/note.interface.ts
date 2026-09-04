import type { z } from "zod";

import {
    createNoteSchema,
    noteParamsSchema,
    updateNoteSchema,
} from "./note.validation.js";

export type ICreateNote = z.infer<
    typeof createNoteSchema
>;

export type IUpdateNote = z.infer<
    typeof updateNoteSchema
>;

export type INoteParams = z.infer<
    typeof noteParamsSchema
>;