import { noteService } from "./note.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from "http-status";
const getNotes = async (req, res) => {
    const user = req.user;
    const result = await noteService.getNotes(req.params.workOrderId, user);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Notes retrieved successfully",
        data: result
    });
};
const createNote = async (req, res) => {
    const user = req.user;
    const result = await noteService.createNote(req.params.workOrderId, user, req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Note created successfully",
        data: result
    });
};
const updateNote = async (req, res) => {
    const user = req.user;
    const result = await noteService.updateNote(req.params.noteId, user, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Note updated successfully",
        data: result
    });
};
const deleteNote = async (req, res) => {
    const user = req.user;
    const result = await noteService.deleteNote(req.params.noteId, user);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Note deleted successfully",
        data: result
    });
};
export const noteController = {
    getNotes,
    createNote,
    updateNote,
    deleteNote,
};
