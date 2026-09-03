import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/appError.js";
import type {
    IAdminAuditLogQuery,
    IAdminUserQuery,
} from "./admin.interface.js";

const getDashboard = async () => {
    const [
        totalUsers,
        totalCustomers,
        totalTechnicians,
        activeTechnicians,
        pendingServiceRequests,
        openWorkOrders,
        completedWorkOrders,
        issuedInvoices,
        paidInvoices,
        pendingPayments,
        paidPayments,
    ] = await prisma.$transaction([
        prisma.user.count(),

        prisma.customer.count(),

        prisma.technician.count(),

        prisma.technician.count({
            where: {
                isActive: true,
            },
        }),

        prisma.serviceRequest.count({
            where: {
                status: {
                    in: ["PENDING", "REVIEWED"],
                },
            },
        }),

        prisma.workOrder.count({
            where: {
                status: {
                    in: [
                        "OPEN",
                        "SCHEDULED",
                        "ASSIGNED",
                        "EN_ROUTE",
                        "IN_PROGRESS",
                        "ON_HOLD",
                    ],
                },
            },
        }),

        prisma.workOrder.count({
            where: {
                status: "COMPLETED",
            },
        }),

        prisma.invoice.count({
            where: {
                status: "ISSUED",
            },
        }),

        prisma.invoice.count({
            where: {
                status: "PAID",
            },
        }),

        prisma.payment.count({
            where: {
                status: "PENDING",
            },
        }),

        prisma.payment.count({
            where: {
                status: "PAID",
            },
        }),
    ]);

    return {
        users: {
            total: totalUsers,
        },
        customers: {
            total: totalCustomers,
        },
        technicians: {
            total: totalTechnicians,
            active: activeTechnicians,
        },
        serviceRequests: {
            pending: pendingServiceRequests,
        },
        workOrders: {
            active: openWorkOrders,
            completed: completedWorkOrders,
        },
        invoices: {
            issued: issuedInvoices,
            paid: paidInvoices,
        },
        payments: {
            pending: pendingPayments,
            paid: paidPayments,
        },
    };
};

const getUsers = async (
    query: IAdminUserQuery,
) => {
    const {
        page,
        limit,
        role,
        isActive,
        search,
    } = query;

    const skip = (page - 1) * limit;

    const where = {
        ...(role && {
            role,
        }),
        ...(isActive !== undefined && {
            isActive,
        }),
        ...(search && {
            email: {
                contains: search,
                mode: "insensitive" as const,
            },
        }),
    };

    const [users, total] = await prisma.$transaction([
        prisma.user.findMany({
            where,
            skip,
            take: limit,
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        }),
        prisma.user.count({
            where,
        }),
    ]);

    return {
        data: users,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

const updateUserStatus = async (
    userId: string,
    isActive: boolean,
) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });

    if (!user) {
        throw new AppError(404, "User not found.");
    }

    return prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            isActive,
        },
        select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            updatedAt: true,
        },
    });
};

const getTechnicians = async () => {
    return prisma.technician.findMany({
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    isActive: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

const updateTechnicianStatus = async (
    technicianId: string,
    isActive: boolean,
) => {
    const technician = await prisma.technician.findUnique({
        where: {
            id: technicianId,
        },
    });

    if (!technician) {
        throw new AppError(404, "Technician not found.");
    }

    return prisma.$transaction(async (tx) => {
        const updated =
            await tx.technician.update({
                where: {
                    id: technicianId,
                },
                data: {
                    isActive,
                },
            });

        await tx.user.update({
            where: {
                id: technician.userId,
            },
            data: {
                isActive,
            },
        });

        return updated;
    });
};

const getPayments = async () => {
    return prisma.payment.findMany({
        include: {
            invoice: {
                select: {
                    id: true,
                    invoiceNumber: true,
                    total: true,
                    status: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

const getAuditLogs = async (
    query: IAdminAuditLogQuery,
) => {
    const {
        page,
        limit,
        entity,
        entityId,
        actorId,
    } = query;

    const skip = (page - 1) * limit;

    const where = {
        ...(entity && { entity }),
        ...(entityId && { entityId }),
        ...(actorId && { actorId }),
    };

    const [logs, total] =
        await prisma.$transaction([
            prisma.auditLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: "desc",
                },
            }),
            prisma.auditLog.count({
                where,
            }),
        ]);

    return {
        data: logs,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const adminService = {
    getDashboard,
    getUsers,
    updateUserStatus,
    getTechnicians,
    updateTechnicianStatus,
    getPayments,
    getAuditLogs,
};