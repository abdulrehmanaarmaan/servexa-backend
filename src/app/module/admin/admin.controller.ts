import type { Request, Response } from "express";

import { adminService } from "./admin.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { IRequestUser } from "../auth/auth.interface.js";
import httpStatus from "http-status";
import { IAdminAuditLogQuery, IAdminUserQuery } from "./admin.interface.js";

const getDashboard = async (
    req: Request,
    res: Response,
) => {
    const result = await adminService.getDashboard();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Admin dashboard retrieved successfully",
        data: result,
    });
};

const getUsers = async (
    req: Request,
    res: Response,
) => {

    const query =
        res.locals.validated.query as IAdminUserQuery;

    const result = await adminService.getUsers(
        query,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Users retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
};

const updateUserStatus = async (
    req: Request,
    res: Response,
) => {

    const result =
        await adminService.updateUserStatus(
            req.params.userId as string,
            req.body.isActive,
        );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User status updated successfully",
        data: result,
    });
};

const getTechnicians = async (
    req: Request,
    res: Response,
) => {
    const result =
        await adminService.getTechnicians();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Technicians retrieved successfully",
        data: result,
    });
};

const updateTechnicianStatus = async (
    req: Request,
    res: Response,
) => {
    const result =
        await adminService.updateTechnicianStatus(
            req.params.technicianId as string,
            req.body.isActive,
        );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Technician status updated successfully",
        data: result,
    });
};

const getPayments = async (
    req: Request,
    res: Response,
) => {

    const result = await adminService.getPayments();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Payments retrieved successfully",
        data: result,
    });
};

const getAuditLogs = async (
    req: Request,
    res: Response,
) => {

    const query =
        res.locals.validated.query as IAdminAuditLogQuery;

    const result =
        await adminService.getAuditLogs(
            query,
        );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Audit logs retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
};

const updateUserRole = async (
    req: Request,
    res: Response,
) => {
    const { userId } = req.params;

    const { role } = req.body;

    const admin = req.user as IRequestUser;

    const result = await adminService.updateUserRole(
        userId as string,
        role,
        admin,
    );

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