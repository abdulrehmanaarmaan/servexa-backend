import httpStatus from "http-status";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/appError.js";
const createWorkOrder = async (serviceRequestId, payload, user) => {
    return prisma.$transaction(async (tx) => {
        const serviceRequest = await tx.serviceRequest.findUnique({
            where: {
                id: serviceRequestId,
            },
            include: {
                service: true,
                customer: true,
                address: true,
                workOrder: true,
            },
        });
        if (!serviceRequest) {
            throw new AppError(httpStatus.NOT_FOUND, "Service request not found");
        }
        if (serviceRequest.workOrder) {
            throw new AppError(httpStatus.CONFLICT, "Work order already exists for this service request");
        }
        if (serviceRequest.status !== "APPROVED") {
            throw new AppError(httpStatus.BAD_REQUEST, "Only approved service requests can be converted into work orders");
        }
        if (!serviceRequest.service.isActive) {
            throw new AppError(httpStatus.BAD_REQUEST, "The selected service is no longer active");
        }
        if (serviceRequest.service.basePrice === null) {
            throw new AppError(httpStatus.BAD_REQUEST, "The selected service does not have a base price");
        }
        const workOrder = await tx.workOrder.create({
            data: {
                serviceRequestId: serviceRequest.id,
                customerId: serviceRequest.customerId,
                serviceId: serviceRequest.serviceId,
                addressId: serviceRequest.addressId,
                servicePrice: serviceRequest.service.basePrice,
                description: payload.description ??
                    serviceRequest.description,
                status: "OPEN",
            },
            include: {
                customer: true,
                service: true,
                address: true,
            },
        });
        await tx.serviceRequest.update({
            where: {
                id: serviceRequest.id,
            },
            data: {
                status: "CONVERTED",
            },
        });
        await tx.jobStatusHistory.create({
            data: {
                workOrderId: workOrder.id,
                fromStatus: null,
                toStatus: "OPEN",
                changedById: user.userId,
                reason: "Work order created from approved service request",
            },
        });
        await tx.auditLog.create({
            data: {
                actorId: user.userId,
                action: "WORK_ORDER_CREATED",
                entity: "WorkOrder",
                entityId: workOrder.id,
                newValue: {
                    serviceRequestId: serviceRequest.id,
                    customerId: serviceRequest.customerId,
                    serviceId: serviceRequest.serviceId,
                    addressId: serviceRequest.addressId,
                    servicePrice: workOrder.servicePrice?.toString(),
                    status: workOrder.status,
                },
            },
        });
        await tx.auditLog.create({
            data: {
                actorId: user.userId,
                action: "SERVICE_REQUEST_CONVERTED",
                entity: "ServiceRequest",
                entityId: serviceRequest.id,
                oldValue: {
                    status: serviceRequest.status,
                },
                newValue: {
                    status: "CONVERTED",
                    workOrderId: workOrder.id,
                },
            },
        });
        return workOrder;
    });
};
const getWorkOrderById = async (workOrderId, user) => {
    const workOrder = await prisma.workOrder.findUnique({
        where: {
            id: workOrderId,
        },
        include: {
            customer: true,
            service: true,
            address: true,
            serviceRequest: true,
            assignments: {
                where: {
                    unassignedAt: null,
                },
                include: {
                    technician: true,
                },
            },
            statusHistory: {
                orderBy: {
                    changedAt: "desc",
                },
            },
            notes: {
                where: {
                    deletedAt: null,
                },
                orderBy: {
                    createdAt: "desc",
                },
            },
            invoice: true,
        },
    });
    if (!workOrder) {
        throw new AppError(httpStatus.NOT_FOUND, "Work order not found");
    }
    /*
     * ADMIN can access every work order.
     */
    if (user.role === "ADMIN") {
        return workOrder;
    }
    /*
     * CUSTOMER can only access their own work orders.
     */
    if (user.role === "CUSTOMER") {
        const customer = await prisma.customer.findUnique({
            where: {
                userId: user.userId,
            },
        });
        if (!customer) {
            throw new AppError(httpStatus.NOT_FOUND, "Customer profile not found");
        }
        if (workOrder.customerId !== customer.id) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not allowed to access this work order");
        }
        return workOrder;
    }
    /*
     * TECHNICIAN can only access a work order
     * assigned to them.
     */
    if (user.role === "TECHNICIAN") {
        const technician = await prisma.technician.findUnique({
            where: {
                userId: user.userId,
            },
        });
        if (!technician) {
            throw new AppError(httpStatus.NOT_FOUND, "Technician profile not found");
        }
        const isAssigned = workOrder.assignments.some((assignment) => assignment.technicianId ===
            technician.id);
        if (!isAssigned) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not assigned to this work order");
        }
        return workOrder;
    }
    throw new AppError(httpStatus.FORBIDDEN, "You are not allowed to access this work order");
};
const getMyWorkOrders = async (user, query) => {
    const customer = await prisma.customer.findUnique({
        where: {
            userId: user.userId,
        },
    });
    if (!customer) {
        throw new AppError(httpStatus.NOT_FOUND, "Customer profile not found");
    }
    const { page, limit, status, sortBy, sortOrder, } = query;
    const skip = (page - 1) * limit;
    const where = {
        customerId: customer.id,
        ...(status && {
            status,
        }),
    };
    const [workOrders, total] = await prisma.$transaction([
        prisma.workOrder.findMany({
            where,
            skip,
            take: limit,
            include: {
                service: true,
                address: true,
                assignments: {
                    where: {
                        unassignedAt: null,
                    },
                    include: {
                        technician: true,
                    },
                },
            },
            orderBy: {
                [sortBy]: sortOrder,
            },
        }),
        prisma.workOrder.count({
            where,
        }),
    ]);
    return {
        data: workOrders,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
const getMyTechnicianWorkOrders = async (user, query) => {
    const technician = await prisma.technician.findUnique({
        where: {
            userId: user.userId,
        },
    });
    if (!technician) {
        throw new AppError(httpStatus.NOT_FOUND, "Technician profile not found");
    }
    const { page, limit, status, sortBy, sortOrder, } = query;
    const skip = (page - 1) * limit;
    const where = {
        ...(status && {
            status,
        }),
        assignments: {
            some: {
                technicianId: technician.id,
                unassignedAt: null,
            },
        },
    };
    const [workOrders, total] = await prisma.$transaction([
        prisma.workOrder.findMany({
            where,
            skip,
            take: limit,
            include: {
                customer: true,
                service: true,
                address: true,
                assignments: {
                    where: {
                        technicianId: technician.id,
                        unassignedAt: null,
                    },
                    include: {
                        technician: true,
                    },
                },
            },
            orderBy: {
                [sortBy]: sortOrder,
            },
        }),
        prisma.workOrder.count({
            where,
        }),
    ]);
    return {
        data: workOrders,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
const getAllWorkOrders = async (query) => {
    const { page, limit, status, sortBy, sortOrder, } = query;
    const skip = (page - 1) * limit;
    const where = {
        ...(status && {
            status,
        }),
    };
    const [workOrders, total] = await prisma.$transaction([
        prisma.workOrder.findMany({
            where,
            skip,
            take: limit,
            include: {
                customer: true,
                service: true,
                address: true,
                assignments: {
                    where: {
                        unassignedAt: null,
                    },
                    include: {
                        technician: true,
                    },
                },
                invoice: true,
            },
            orderBy: {
                [sortBy]: sortOrder,
            },
        }),
        prisma.workOrder.count({
            where,
        }),
    ]);
    return {
        data: workOrders,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
const updateWorkOrder = async (workOrderId, payload, user) => {
    return prisma.$transaction(async (tx) => {
        const workOrder = await tx.workOrder.findUnique({
            where: {
                id: workOrderId,
            },
        });
        if (!workOrder) {
            throw new AppError(httpStatus.NOT_FOUND, "Work order not found");
        }
        if (workOrder.status === "COMPLETED") {
            throw new AppError(httpStatus.BAD_REQUEST, "Completed work orders cannot be modified");
        }
        if (workOrder.status === "CANCELLED") {
            throw new AppError(httpStatus.BAD_REQUEST, "Cancelled work orders cannot be modified");
        }
        const updatedWorkOrder = await tx.workOrder.update({
            where: {
                id: workOrderId,
            },
            data: {
                ...(payload.description !==
                    undefined && {
                    description: payload.description,
                }),
            },
        });
        await tx.auditLog.create({
            data: {
                actorId: user.userId,
                action: "WORK_ORDER_UPDATED",
                entity: "WorkOrder",
                entityId: workOrder.id,
                oldValue: {
                    description: workOrder.description,
                },
                newValue: {
                    description: updatedWorkOrder.description,
                },
            },
        });
        return updatedWorkOrder;
    });
};
const updateWorkOrderStatus = async (workOrderId, payload, user) => {
    return prisma.$transaction(async (tx) => {
        const workOrder = await tx.workOrder.findUnique({
            where: {
                id: workOrderId,
            },
            include: {
                assignments: {
                    where: {
                        unassignedAt: null,
                    },
                },
            },
        });
        if (!workOrder) {
            throw new AppError(httpStatus.NOT_FOUND, "Work order not found");
        }
        const currentStatus = workOrder.status;
        const nextStatus = payload.status;
        if (currentStatus === nextStatus) {
            throw new AppError(httpStatus.BAD_REQUEST, "Work order is already in this status");
        }
        /*
         * Valid status transitions.
         */
        const allowedTransitions = {
            OPEN: [
                "SCHEDULED",
                "ASSIGNED",
                "CANCELLED",
            ],
            SCHEDULED: [
                "ASSIGNED",
                "CANCELLED",
            ],
            ASSIGNED: [
                "EN_ROUTE",
                "IN_PROGRESS",
                "CANCELLED",
            ],
            EN_ROUTE: [
                "IN_PROGRESS",
                "ON_HOLD",
                "CANCELLED",
            ],
            IN_PROGRESS: [
                "ON_HOLD",
                "COMPLETED",
                "CANCELLED",
            ],
            ON_HOLD: [
                "IN_PROGRESS",
                "CANCELLED",
            ],
            COMPLETED: [],
            CANCELLED: [],
        };
        if (!allowedTransitions[currentStatus]?.includes(nextStatus)) {
            throw new AppError(httpStatus.BAD_REQUEST, `Cannot change work order status from ${currentStatus} to ${nextStatus}`);
        }
        /*
         * Technician must actually be assigned
         * before moving the job into technician
         * execution states.
         */
        if (user.role === "TECHNICIAN" &&
            [
                "EN_ROUTE",
                "IN_PROGRESS",
                "ON_HOLD",
                "COMPLETED",
            ].includes(nextStatus)) {
            const technician = await tx.technician.findUnique({
                where: {
                    userId: user.userId,
                },
            });
            if (!technician) {
                throw new AppError(httpStatus.NOT_FOUND, "Technician profile not found");
            }
            const isAssigned = workOrder.assignments.some((assignment) => assignment.technicianId ===
                technician.id);
            if (!isAssigned) {
                throw new AppError(httpStatus.FORBIDDEN, "You are not assigned to this work order");
            }
        }
        /*
         * Only ADMIN can cancel a work order
         * from the management side.
         *
         * A technician can cancel only if your
         * business rules explicitly allow it.
         * For Servexa, keep cancellation admin-only.
         */
        if (nextStatus === "CANCELLED" &&
            user.role !== "ADMIN") {
            throw new AppError(httpStatus.FORBIDDEN, "Only an admin can cancel a work order");
        }
        const updatedWorkOrder = await tx.workOrder.update({
            where: {
                id: workOrderId,
            },
            data: {
                status: nextStatus,
            },
        });
        await tx.jobStatusHistory.create({
            data: {
                workOrderId,
                fromStatus: currentStatus,
                toStatus: nextStatus,
                changedById: user.userId,
                reason: payload.reason ??
                    null,
            },
        });
        await tx.auditLog.create({
            data: {
                actorId: user.userId,
                action: "WORK_ORDER_STATUS_UPDATED",
                entity: "WorkOrder",
                entityId: workOrderId,
                oldValue: {
                    status: currentStatus,
                },
                newValue: {
                    status: nextStatus,
                    reason: payload.reason ?? null,
                },
            },
        });
        return updatedWorkOrder;
    });
};
const scheduleWorkOrder = async (workOrderId, payload, user) => {
    return prisma.$transaction(async (tx) => {
        const workOrder = await tx.workOrder.findUnique({
            where: {
                id: workOrderId,
            },
        });
        if (!workOrder) {
            throw new AppError(httpStatus.NOT_FOUND, "Work order not found");
        }
        if (workOrder.status === "COMPLETED") {
            throw new AppError(httpStatus.BAD_REQUEST, "Completed work orders cannot be rescheduled");
        }
        if (workOrder.status === "CANCELLED") {
            throw new AppError(httpStatus.BAD_REQUEST, "Cancelled work orders cannot be scheduled");
        }
        const updatedWorkOrder = await tx.workOrder.update({
            where: {
                id: workOrderId,
            },
            data: {
                scheduledStart: payload.scheduledStart,
                scheduledEnd: payload.scheduledEnd,
                status: "SCHEDULED",
            },
        });
        await tx.jobStatusHistory.create({
            data: {
                workOrderId,
                fromStatus: workOrder.status,
                toStatus: "SCHEDULED",
                changedById: user.userId,
                reason: "Work order scheduled",
            },
        });
        await tx.auditLog.create({
            data: {
                actorId: user.userId,
                action: "WORK_ORDER_SCHEDULED",
                entity: "WorkOrder",
                entityId: workOrderId,
                oldValue: {
                    status: workOrder.status,
                    scheduledStart: workOrder.scheduledStart,
                    scheduledEnd: workOrder.scheduledEnd,
                },
                newValue: {
                    status: "SCHEDULED",
                    scheduledStart: payload.scheduledStart,
                    scheduledEnd: payload.scheduledEnd,
                },
            },
        });
        return updatedWorkOrder;
    });
};
export const workOrderService = {
    createWorkOrder,
    getWorkOrderById,
    getMyWorkOrders,
    getMyTechnicianWorkOrders,
    getAllWorkOrders,
    updateWorkOrder,
    updateWorkOrderStatus,
    scheduleWorkOrder,
};
