import type { Request, Response } from "express";

import { availabilityService } from "./availability.service.js";
import type { IRequestUser } from "../auth/auth.interface.js";

const getMyAvailabilities = async (
    req: Request,
    res: Response,
) => {
    const user = req.user as IRequestUser;

    const result =
        await availabilityService.getMyAvailabilities(user);

    res.status(200).json({
        success: true,
        message: "Availabilities retrieved successfully",
        data: result,
    });
};

const createAvailability = async (
    req: Request,
    res: Response,
) => {
    const user = req.user as IRequestUser;

    const result =
        await availabilityService.createAvailability(
            user,
            req.body,
        );

    res.status(201).json({
        success: true,
        message: "Availability created successfully",
        data: result,
    });
};

const updateAvailability = async (
    req: Request,
    res: Response,
) => {
    const user = req.user as IRequestUser;

    const result =
        await availabilityService.updateAvailability(
            user,
            req.params.availabilityId as string,
            req.body,
        );

    res.status(200).json({
        success: true,
        message: "Availability updated successfully",
        data: result,
    });
};

const deleteAvailability = async (
    req: Request,
    res: Response,
) => {
    const user = req.user as IRequestUser;

    const result =
        await availabilityService.deleteAvailability(
            user,
            req.params.availabilityId as string,
        );

    res.status(200).json({
        success: true,
        message: "Availability deleted successfully",
        data: result,
    });
};

export const availabilityController = {
    getMyAvailabilities,
    createAvailability,
    updateAvailability,
    deleteAvailability,
};