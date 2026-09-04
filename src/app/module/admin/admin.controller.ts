import type { Request, Response } from "express";

import { adminService } from "./admin.service.js";

const getDashboard = async (
    req: Request,
    res: Response,
) => {
    const result = await adminService.getDashboard();

    res.status(200).json({
        success: true,
        message: "Admin dashboard retrieved successfully",
        data: result,
    });
};

const getUsers = async (
    req: Request,
    res: Response,
) => {
    const result = await adminService.getUsers(
        req.query as any,
    );

    res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        data: result,
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

    res.status(200).json({
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

    res.status(200).json({
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

    res.status(200).json({
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

    res.status(200).json({
        success: true,
        message: "Payments retrieved successfully",
        data: result,
    });
};

const getAuditLogs = async (
    req: Request,
    res: Response,
) => {
    const result =
        await adminService.getAuditLogs(
            req.query as any,
        );

    res.status(200).json({
        success: true,
        message: "Audit logs retrieved successfully",
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
};