import type { Request, Response } from "express";

import { assignmentService } from "./assignment.service.js";
import type { IRequestUser } from "../auth/auth.interface.js";

const getAssignments = async (
    req: Request,
    res: Response,
) => {
    const result =
        await assignmentService.getAssignments(
            req.params.workOrderId as string,
        );

    res.status(200).json({
        success: true,
        message: "Assignments retrieved successfully",
        data: result,
    });
};

const createAssignment = async (
    req: Request,
    res: Response,
) => {
    const user = req.user as IRequestUser;

    const result =
        await assignmentService.createAssignment(
            req.params.workOrderId as string,
            req.body.technicianId,
            user,
        );

    res.status(201).json({
        success: true,
        message: "Technician assigned successfully",
        data: result,
    });
};

const unassignTechnician = async (
    req: Request,
    res: Response,
) => {
    const user = req.user as IRequestUser;

    const result =
        await assignmentService.unassignTechnician(
            req.params.workOrderId as string,
            req.params.assignmentId as string,
            user,
        );

    res.status(200).json({
        success: true,
        message: "Technician unassigned successfully",
        data: result,
    });
};

export const assignmentController = {
    getAssignments,
    createAssignment,
    unassignTechnician,
};