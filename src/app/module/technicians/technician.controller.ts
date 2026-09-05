import type { Request, Response } from "express";

import { technicianService } from "./technician.service.js";
import type { IRequestUser } from "../auth/auth.interface.js";
import { ITechnicianQuery } from "./technician.interface.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from "http-status"

const getMyTechnicianProfile = async (
    req: Request,
    res: Response,
) => {
    const user = req.user as IRequestUser;

    const result =
        await technicianService.getMyTechnicianProfile(user);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Technician profile retrieved successfully",
        data: result
    })
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

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Technician profile updated successfully",
        data: result
    })
};

const getTechnicianById = async (
    req: Request,
    res: Response,
) => {
    const result =
        await technicianService.getTechnicianById(
            req.params.technicianId as string,
        );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Technician retrieved successfully",
        data: result
    })
};

const getAllTechnicians = async (
    req: Request,
    res: Response,
) => {

    const query =
        res.locals.validated.query as ITechnicianQuery;

    const result =
        await technicianService.getAllTechnicians(query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Technicians retrieved successfully",
        data: result.data,
        meta: result.meta
    })
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

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Technician status updated successfully",
        data: result
    })
};

export const technicianController = {
    getMyTechnicianProfile,
    updateMyTechnicianProfile,
    getTechnicianById,
    getAllTechnicians,
    updateTechnicianStatus,
};