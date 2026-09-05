import { assignmentService } from "./assignment.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from "http-status";
const getAssignments = async (req, res) => {
    const result = await assignmentService.getAssignments(req.params.workOrderId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Assignments retrieved successfully",
        data: result
    });
};
const createAssignment = async (req, res) => {
    const user = req.user;
    const result = await assignmentService.createAssignment(req.params.workOrderId, req.body.technicianId, user);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Technician assigned successfully",
        data: result
    });
};
const unassignTechnician = async (req, res) => {
    const user = req.user;
    const result = await assignmentService.unassignTechnician(req.params.workOrderId, req.params.assignmentId, user);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Technician unassigned successfully",
        data: result
    });
};
export const assignmentController = {
    getAssignments,
    createAssignment,
    unassignTechnician,
};
