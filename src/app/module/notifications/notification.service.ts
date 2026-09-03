import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/appError.js";
import type { IRequestUser } from "../auth/auth.interface.js";
import type { INotificationQuery } from "./notification.interface.js";

const getMyNotifications = async (
    user: IRequestUser,
    query: INotificationQuery,
) => {
    const {
        page,
        limit,
        isRead,
    } = query;

    const skip = (page - 1) * limit;

    const where = {
        userId: user.userId,
        ...(isRead !== undefined && {
            isRead,
        }),
    };

    const [notifications, total] =
        await prisma.$transaction([
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

const markAsRead = async (
    user: IRequestUser,
    notificationId: string,
) => {
    const notification =
        await prisma.notification.findFirst({
            where: {
                id: notificationId,
                userId: user.userId,
            },
        });

    if (!notification) {
        throw new AppError(
            404,
            "Notification not found.",
        );
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

const markAllAsRead = async (
    user: IRequestUser,
) => {
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
    getMyNotifications,
    markAsRead,
    markAllAsRead,
};