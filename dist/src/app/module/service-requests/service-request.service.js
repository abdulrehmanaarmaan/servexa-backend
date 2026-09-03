import httpStatus from "http-status";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/appError.js";
const createServiceRequest = async (payload, user) => {
    const customer = await prisma.customer.findUnique({
        where: {
            userId: user.userId,
        },
    });
    if (!customer) {
        throw new AppError(httpStatus.NOT_FOUND, "Customer profile not found");
    }
    const service = await prisma.service.findUnique({
        where: {
            id: payload.serviceId,
        },
    });
    if (!service) {
        throw new AppError(httpStatus.NOT_FOUND, "Service not found");
    }
    if (!service.isActive || service.deletedAt) {
        throw new AppError(httpStatus.BAD_REQUEST, "This service is not currently available");
    }
    const address = await prisma.address.findFirst({
        where: {
            id: payload.addressId,
            customerId: customer.id,
            deletedAt: null,
        },
    });
    if (!address) {
        throw new AppError(httpStatus.NOT_FOUND, "Address not found");
    }
    const serviceRequest = await prisma.serviceRequest.create({
        data: {
            customerId: customer.id,
            serviceId: service.id,
            addressId: address.id,
            description: payload.description,
            priority: payload.priority,
            status: "PENDING",
        },
        include: {
            service: true,
            address: true,
        },
    });
    await prisma.auditLog.create({
        data: {
            actorId: user.userId,
            action: "SERVICE_REQUEST_CREATED",
            entity: "ServiceRequest",
            entityId: serviceRequest.id,
            newValue: {
                customerId: customer.id,
                serviceId: service.id,
                addressId: address.id,
                priority: serviceRequest.priority,
                status: serviceRequest.status,
            },
        },
    });
    return serviceRequest;
};
const getServiceRequestById = async (serviceRequestId, user) => {
    const serviceRequest = await prisma.serviceRequest.findUnique({
        where: {
            id: serviceRequestId,
        },
        include: {
            customer: true,
            service: true,
            address: true,
            workOrder: true,
        },
    });
    if (!serviceRequest) {
        throw new AppError(httpStatus.NOT_FOUND, "Service request not found");
    }
    if (user.role === "ADMIN") {
        return serviceRequest;
    }
    if (user.role === "CUSTOMER") {
        const customer = await prisma.customer.findUnique({
            where: {
                userId: user.userId,
            },
        });
        if (!customer) {
            throw new AppError(httpStatus.NOT_FOUND, "Customer profile not found");
        }
        if (serviceRequest.customerId !==
            customer.id) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not allowed to access this service request");
        }
        return serviceRequest;
    }
    throw new AppError(httpStatus.FORBIDDEN, "You are not allowed to access this service request");
};
const getMyServiceRequests = async (user, query) => {
    const customer = await prisma.customer.findUnique({
        where: {
            userId: user.userId,
        },
    });
    if (!customer) {
        throw new AppError(httpStatus.NOT_FOUND, "Customer profile not found");
    }
    const { page, limit, status, priority, sortBy, sortOrder, } = query;
    const skip = (page - 1) * limit;
    const where = {
        customerId: customer.id,
        ...(status && {
            status,
        }),
        ...(priority && {
            priority,
        }),
    };
    const [requests, total] = await prisma.$transaction([
        prisma.serviceRequest.findMany({
            where,
            skip,
            take: limit,
            include: {
                service: true,
                address: true,
                workOrder: true,
            },
            orderBy: {
                [sortBy]: sortOrder,
            },
        }),
        prisma.serviceRequest.count({
            where,
        }),
    ]);
    return {
        data: requests,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
const getAllServiceRequests = async (query) => {
    const { page, limit, status, priority, sortBy, sortOrder, } = query;
    const skip = (page - 1) * limit;
    const where = {
        ...(status && {
            status,
        }),
        ...(priority && {
            priority,
        }),
    };
    const [requests, total] = await prisma.$transaction([
        prisma.serviceRequest.findMany({
            where,
            skip,
            take: limit,
            include: {
                customer: true,
                service: true,
                address: true,
                workOrder: true,
            },
            orderBy: {
                [sortBy]: sortOrder,
            },
        }),
        prisma.serviceRequest.count({
            where,
        }),
    ]);
    return {
        data: requests,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
const updateServiceRequest = async (serviceRequestId, payload, user) => {
    return prisma.$transaction(async (tx) => {
        const serviceRequest = await tx.serviceRequest.findUnique({
            where: {
                id: serviceRequestId,
            },
        });
        if (!serviceRequest) {
            throw new AppError(httpStatus.NOT_FOUND, "Service request not found");
        }
        if (serviceRequest.customerId !==
            (await tx.customer.findUnique({
                where: {
                    userId: user.userId,
                },
            }))?.id) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not allowed to update this service request");
        }
        /*
         * Customer can only edit a request
         * while it is still pending.
         */
        if (serviceRequest.status !== "PENDING") {
            throw new AppError(httpStatus.BAD_REQUEST, "Only pending service requests can be updated");
        }
        if (payload.serviceId) {
            const service = await tx.service.findUnique({
                where: {
                    id: payload.serviceId,
                },
            });
            if (!service ||
                !service.isActive ||
                service.deletedAt) {
                throw new AppError(httpStatus.BAD_REQUEST, "Selected service is not available");
            }
        }
        if (payload.addressId) {
            const address = await tx.address.findFirst({
                where: {
                    id: payload.addressId,
                    customerId: serviceRequest.customerId,
                    deletedAt: null,
                },
            });
            if (!address) {
                throw new AppError(httpStatus.NOT_FOUND, "Address not found");
            }
        }
        const updatedRequest = await tx.serviceRequest.update({
            where: {
                id: serviceRequestId,
            },
            data: {
                ...(payload.serviceId !==
                    undefined && {
                    serviceId: payload.serviceId,
                }),
                ...(payload.addressId !==
                    undefined && {
                    addressId: payload.addressId,
                }),
                ...(payload.description !==
                    undefined && {
                    description: payload.description,
                }),
                ...(payload.priority !==
                    undefined && {
                    priority: payload.priority,
                }),
            },
            include: {
                service: true,
                address: true,
            },
        });
        await tx.auditLog.create({
            data: {
                actorId: user.userId,
                action: "SERVICE_REQUEST_UPDATED",
                entity: "ServiceRequest",
                entityId: serviceRequest.id,
                oldValue: {
                    serviceId: serviceRequest.serviceId,
                    addressId: serviceRequest.addressId,
                    description: serviceRequest.description,
                    priority: serviceRequest.priority,
                },
                newValue: {
                    serviceId: updatedRequest.serviceId,
                    addressId: updatedRequest.addressId,
                    description: updatedRequest.description,
                    priority: updatedRequest.priority,
                },
            },
        });
        return updatedRequest;
    });
};
const updateServiceRequestStatus = async (serviceRequestId, payload, user) => {
    return prisma.$transaction(async (tx) => {
        const serviceRequest = await tx.serviceRequest.findUnique({
            where: {
                id: serviceRequestId,
            },
        });
        if (!serviceRequest) {
            throw new AppError(httpStatus.NOT_FOUND, "Service request not found");
        }
        const currentStatus = serviceRequest.status;
        const nextStatus = payload.status;
        if (currentStatus === nextStatus) {
            throw new AppError(httpStatus.BAD_REQUEST, "Service request is already in this status");
        }
        /*
         * Only ADMIN controls the review/
         * approval/rejection lifecycle.
         */
        if (user.role !== "ADMIN") {
            throw new AppError(httpStatus.FORBIDDEN, "Only an admin can change the service request status");
        }
        const allowedTransitions = {
            PENDING: [
                "REVIEWED",
                "APPROVED",
                "REJECTED",
                "CANCELLED",
            ],
            REVIEWED: [
                "APPROVED",
                "REJECTED",
                "CANCELLED",
            ],
            APPROVED: [
                "CONVERTED",
                "CANCELLED",
            ],
            REJECTED: [],
            CONVERTED: [],
            CANCELLED: [],
        };
        if (!allowedTransitions[currentStatus]?.includes(nextStatus)) {
            throw new AppError(httpStatus.BAD_REQUEST, `Cannot change service request status from ${currentStatus} to ${nextStatus}`);
        }
        const updatedRequest = await tx.serviceRequest.update({
            where: {
                id: serviceRequestId,
            },
            data: {
                status: nextStatus,
            },
        });
        await tx.auditLog.create({
            data: {
                actorId: user.userId,
                action: "SERVICE_REQUEST_STATUS_UPDATED",
                entity: "ServiceRequest",
                entityId: serviceRequestId,
                oldValue: {
                    status: currentStatus,
                },
                newValue: {
                    status: nextStatus,
                    reason: payload.reason ??
                        null,
                },
            },
        });
        return updatedRequest;
    });
};
const cancelServiceRequest = async (serviceRequestId, user) => {
    return prisma.$transaction(async (tx) => {
        const customer = await tx.customer.findUnique({
            where: {
                userId: user.userId,
            },
        });
        if (!customer) {
            throw new AppError(httpStatus.NOT_FOUND, "Customer profile not found");
        }
        const serviceRequest = await tx.serviceRequest.findUnique({
            where: {
                id: serviceRequestId,
            },
        });
        if (!serviceRequest) {
            throw new AppError(httpStatus.NOT_FOUND, "Service request not found");
        }
        if (serviceRequest.customerId !==
            customer.id) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not allowed to cancel this service request");
        }
        if (![
            "PENDING",
            "REVIEWED",
            "APPROVED",
        ].includes(serviceRequest.status)) {
            throw new AppError(httpStatus.BAD_REQUEST, "This service request cannot be cancelled");
        }
        const updatedRequest = await tx.serviceRequest.update({
            where: {
                id: serviceRequestId,
            },
            data: {
                status: "CANCELLED",
            },
        });
        await tx.auditLog.create({
            data: {
                actorId: user.userId,
                action: "SERVICE_REQUEST_CANCELLED",
                entity: "ServiceRequest",
                entityId: serviceRequestId,
                oldValue: {
                    status: serviceRequest.status,
                },
                newValue: {
                    status: "CANCELLED",
                },
            },
        });
        return updatedRequest;
    });
};
export const serviceRequestService = {
    createServiceRequest,
    getServiceRequestById,
    getMyServiceRequests,
    getAllServiceRequests,
    updateServiceRequest,
    updateServiceRequestStatus,
    cancelServiceRequest,
};
