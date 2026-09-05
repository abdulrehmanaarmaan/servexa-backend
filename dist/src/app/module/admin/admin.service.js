import { UserRole } from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/appError.js";
import httpStatus from "http-status";
const getDashboard = async () => {
    const [totalUsers, totalCustomers, totalTechnicians, activeTechnicians, pendingServiceRequests, openWorkOrders, completedWorkOrders, issuedInvoices, paidInvoices, pendingPayments, paidPayments,] = await prisma.$transaction([
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
const getUsers = async (query) => {
    const { page, limit, role, isActive, search, } = query;
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
                mode: "insensitive",
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
const updateUserStatus = async (userId, isActive) => {
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
const updateTechnicianStatus = async (technicianId, isActive) => {
    const technician = await prisma.technician.findUnique({
        where: {
            id: technicianId,
        },
    });
    if (!technician) {
        throw new AppError(404, "Technician not found.");
    }
    return prisma.$transaction(async (tx) => {
        const updated = await tx.technician.update({
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
const getAuditLogs = async (query) => {
    const { page, limit, entity, entityId, actorId, } = query;
    const skip = (page - 1) * limit;
    const where = {
        ...(entity && { entity }),
        ...(entityId && { entityId }),
        ...(actorId && { actorId }),
    };
    const [logs, total] = await prisma.$transaction([
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
const updateUserRole = async (userId, newRole, admin) => {
    // Prevent an admin from changing their own role
    if (userId === admin.userId) {
        throw new AppError(httpStatus.FORBIDDEN, "You cannot change your own role.");
    }
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found.");
    }
    // Prevent unnecessary role update
    if (user.role === newRole) {
        throw new AppError(httpStatus.BAD_REQUEST, `User already has the ${newRole} role.`);
    }
    // Prevent assigning ADMIN through this endpoint
    if (newRole === UserRole.ADMIN) {
        throw new AppError(httpStatus.FORBIDDEN, "ADMIN role cannot be assigned through this endpoint.");
    }
    const updatedUser = await prisma.$transaction(async (tx) => {
        const updated = await tx.user.update({
            where: {
                id: userId,
            },
            data: {
                role: newRole,
            },
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        // Create technician profile when user becomes TECHNICIAN
        if (newRole === UserRole.TECHNICIAN) {
            const existingCustomer = await tx.customer.findUnique({
                where: {
                    userId: user.id,
                },
                select: {
                    name: true,
                },
            });
            await tx.technician.upsert({
                where: {
                    userId: user.id,
                },
                update: {
                    isActive: true,
                },
                create: {
                    userId: user.id,
                    name: existingCustomer?.name ?? user.email,
                    isActive: true,
                },
            });
        }
        await tx.auditLog.create({
            data: {
                actorId: admin.userId,
                action: "USER_ROLE_CHANGED",
                entity: "User",
                entityId: user.id,
                oldValue: {
                    role: user.role,
                },
                newValue: {
                    role: newRole,
                },
            },
        });
        return updated;
    });
    return updatedUser;
};
export const adminService = {
    getDashboard,
    getUsers,
    updateUserStatus,
    getTechnicians,
    updateTechnicianStatus,
    getPayments,
    getAuditLogs,
    updateUserRole,
};
