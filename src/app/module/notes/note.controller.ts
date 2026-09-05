import type { Request, Response } from "express";

import { noteService } from "./note.service.js";
import type { IRequestUser } from "../auth/auth.interface.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from "http-status"

const getNotes = async (
    req: Request,
    res: Response,
) => {
    const user = req.user as IRequestUser;

    const result = await noteService.getNotes(
        req.params.workOrderId as string,
        user,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Notes retrieved successfully",
        data: result
    })
};

const createNote = async (
    req: Request,
    res: Response,
) => {
    const user = req.user as IRequestUser;

    const result = await noteService.createNote(
        req.params.workOrderId as string,
        user,
        req.body,
    );

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Note created successfully",
        data: result
    })
};

const updateNote = async (
    req: Request,
    res: Response,
) => {
    const user = req.user as IRequestUser;

    const result = await noteService.updateNote(
        req.params.noteId as string,
        user,
        req.body,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Note updated successfully",
        data: result
    })
};

const deleteNote = async (
    req: Request,
    res: Response,
) => {
    const user = req.user as IRequestUser;

    const result = await noteService.deleteNote(
        req.params.noteId as string,
        user,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Note deleted successfully",
        data: result
    })
};

export const noteController = {
    getNotes,
    createNote,
    updateNote,
    deleteNote,
};