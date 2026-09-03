import type { Request, Response } from "express";

import { notificationService } from "./notification.service.js";
import type { IRequestUser } from "../auth/auth.interface.js";

const getMyNotifications = async (
    req: Request,
    res: Response,
) => {
    const user = req.user as IRequestUser;

    const result =
        await notificationService.getMyNotifications(
            user,
            req.query as any,
        );

    res.status(200).json({
        success: true,
        message: "Notifications retrieved successfully",
        data: result,
    });
};

const markAsRead = async (
    req: Request,
    res: Response,
) => {
    const user = req.user as IRequestUser;

    const result =
        await notificationService.markAsRead(
            user,
            req.params.notificationId as string,
        );

    res.status(200).json({
        success: true,
        message: "Notification marked as read",
        data: result,
    });
};

const markAllAsRead = async (
    req: Request,
    res: Response,
) => {
    const user = req.user as IRequestUser;

    const result =
        await notificationService.markAllAsRead(user);

    res.status(200).json({
        success: true,
        message: "All notifications marked as read",
        data: result,
    });
};

export const notificationController = {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
};