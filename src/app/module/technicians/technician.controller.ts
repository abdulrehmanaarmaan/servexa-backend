import type { Request, Response } from "express";

import { technicianService } from "./technician.service.js";
import type { IRequestUser } from "../auth/auth.interface.js";

const getMyTechnicianProfile = async (
    req: Request,
    res: Response,
) => {
    const user = req.user as IRequestUser;

    const result =
        await technicianService.getMyTechnicianProfile(user);

    res.status(200).json({
        success: true,
        message: "Technician profile retrieved successfully",
        data: result,
    });
};

const updateMyTechnicianProfile = async (
    req: Request,
    res: Response,
) => {
    const user = req.user as IRequestUser;

    const result =
        await technicianService.updateMyTechnicianProfile(
            user,
            req.body,
        );

    res.status(200).json({
        success: true,
        message: "Technician profile updated successfully",
        data: result,
    });
};

const getTechnicianById = async (
    req: Request,
    res: Response,
) => {
    const result =
        await technicianService.getTechnicianById(
            req.params.technicianId as string,
        );

    res.status(200).json({
        success: true,
        message: "Technician retrieved successfully",
        data: result,
    });
};

const getAllTechnicians = async (
    req: Request,
    res: Response,
) => {
    const result =
        await technicianService.getAllTechnicians(req.query as any);

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
        await technicianService.updateTechnicianStatus(
            req.params.technicianId as string,
            req.body.isActive,
        );

    res.status(200).json({
        success: true,
        message: "Technician status updated successfully",
        data: result,
    });
};

export const technicianController = {
    getMyTechnicianProfile,
    updateMyTechnicianProfile,
    getTechnicianById,
    getAllTechnicians,
    updateTechnicianStatus,
};