import { notificationService } from "./notification.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from "http-status";
const createNotification = async (req, res) => {
    const result = await notificationService.createNotification(req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Notification created successfully",
        data: result,
    });
};
const getMyNotifications = async (req, res) => {
    const user = req.user;
    const query = res.locals.validated.query;
    const result = await notificationService.getMyNotifications(user, query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Notifications retrieved successfully",
        data: result,
    });
};
const markAsRead = async (req, res) => {
    const user = req.user;
    const result = await notificationService.markAsRead(user, req.params.notificationId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Notification marked as read",
        data: result,
    });
};
const markAllAsRead = async (req, res) => {
    const user = req.user;
    const result = await notificationService.markAllAsRead(user);
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
