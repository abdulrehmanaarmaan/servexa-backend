import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/appError.js";
import httpStatus from "http-status";
const createNotification = async (payload) => {
    const user = await prisma.user.findUnique({
        where: {
            id: payload.userId,
        },
        select: {
            id: true,
            isActive: true,
        },
    });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found.");
    }
    if (!user.isActive) {
        throw new AppError(httpStatus.BAD_REQUEST, "Cannot create a notification for an inactive user.");
    }
    const notification = await prisma.notification.create({
        data: {
            userId: payload.userId,
            title: payload.title,
            message: payload.message,
            type: payload.type,
        },
    });
    return notification;
};
const getMyNotifications = async (user, query) => {
    const { page, limit, isRead, } = query;
    const skip = (page - 1) * limit;
    const where = {
        userId: user.userId,
        ...(isRead !== undefined && {
            isRead,
        }),
    };
    const [notifications, total] = await prisma.$transaction([
        prisma.notification.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
        }),
        prisma.notification.count({
            where,
        }),
    ]);
    return {
        data: notifications,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
const markAsRead = async (user, notificationId) => {
    const notification = await prisma.notification.findFirst({
        where: {
            id: notificationId,
            userId: user.userId,
        },
    });
    if (!notification) {
        throw new AppError(404, "Notification not found.");
    }
    return prisma.notification.update({
        where: {
            id: notificationId,
        },
        data: {
            isRead: true,
        },
    });
};
const markAllAsRead = async (user) => {
    await prisma.notification.updateMany({
        where: {
            userId: user.userId,
            isRead: false,
        },
        data: {
            isRead: true,
        },
    });
    return null;
};
export const notificationService = {
    createNotification,
    getMyNotifications,
    markAsRead,
    markAllAsRead
};
