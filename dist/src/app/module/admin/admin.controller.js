import { adminService } from "./admin.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from "http-status";
const getDashboard = async (req, res) => {
    const result = await adminService.getDashboard();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Admin dashboard retrieved successfully",
        data: result,
    });
};
const getUsers = async (req, res) => {
    const query = res.locals.validated.query;
    const result = await adminService.getUsers(query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Users retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
};
const updateUserStatus = async (req, res) => {
    const result = await adminService.updateUserStatus(req.params.userId, req.body.isActive);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User status updated successfully",
        data: result,
    });
};
const getTechnicians = async (req, res) => {
    const result = await adminService.getTechnicians();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Technicians retrieved successfully",
        data: result,
    });
};
const updateTechnicianStatus = async (req, res) => {
    const result = await adminService.updateTechnicianStatus(req.params.technicianId, req.body.isActive);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Technician status updated successfully",
        data: result,
    });
};
const getPayments = async (req, res) => {
    const result = await adminService.getPayments();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Payments retrieved successfully",
        data: result,
    });
};
const getAuditLogs = async (req, res) => {
    const query = res.locals.validated.query;
    const result = await adminService.getAuditLogs(query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Audit logs retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
};
const updateUserRole = async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;
    const admin = req.user;
    const result = await adminService.updateUserRole(userId, role, admin);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User role updated successfully",
        data: result,
    });
};
export const adminController = {
    getDashboard,
    getUsers,
    updateUserStatus,
    getTechnicians,
    updateTechnicianStatus,
    getPayments,
    getAuditLogs,
    updateUserRole,
};
