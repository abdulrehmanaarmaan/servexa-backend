import { technicianService } from "./technician.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from "http-status";
const getMyTechnicianProfile = async (req, res) => {
    const user = req.user;
    const result = await technicianService.getMyTechnicianProfile(user);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Technician profile retrieved successfully",
        data: result
    });
};
const updateMyTechnicianProfile = async (req, res) => {
    const user = req.user;
    const result = await technicianService.updateMyTechnicianProfile(user, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Technician profile updated successfully",
        data: result
    });
};
const getTechnicianById = async (req, res) => {
    const result = await technicianService.getTechnicianById(req.params.technicianId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Technician retrieved successfully",
        data: result
    });
};
const getAllTechnicians = async (req, res) => {
    const query = res.locals.validated.query;
    const result = await technicianService.getAllTechnicians(query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Technicians retrieved successfully",
        data: result.data,
        meta: result.meta
    });
};
const updateTechnicianStatus = async (req, res) => {
    const result = await technicianService.updateTechnicianStatus(req.params.technicianId, req.body.isActive);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Technician status updated successfully",
        data: result
    });
};
export const technicianController = {
    getMyTechnicianProfile,
    updateMyTechnicianProfile,
    getTechnicianById,
    getAllTechnicians,
    updateTechnicianStatus,
};
