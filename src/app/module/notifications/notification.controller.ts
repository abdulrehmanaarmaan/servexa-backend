import type { Request, Response } from "express";

import { notificationService } from "./notification.service.js";
import type { IRequestUser } from "../auth/auth.interface.js";
import { INotificationQuery } from "./notification.interface.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from "http-status";

const createNotification = async (
    req: Request,
    res: Response,
) => {
    const result =
        await notificationService.createNotification(req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Notification created successfully",
        data: result,
    });
};

const getMyNotifications = async (
    req: Request,
    res: Response,
) => {
    const user = req.user as IRequestUser;

    const query =
        res.locals.validated.query as INotificationQuery;

    const result =
        await notificationService.getMyNotifications(
            user,
            query,
        );

    sendResponse(res, {
        statusCode: httpStatus.OK,
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

    sendResponse(res, {
        statusCode: httpStatus.OK,
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

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "All notifications marked as read",
        data: result,
    });
};

export const notificationController = {
    createNotification,
    getMyNotifications,
    markAsRead,
    markAllAsRead,
};