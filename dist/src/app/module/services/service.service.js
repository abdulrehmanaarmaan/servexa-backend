import httpStatus from "http-status";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/appError.js";
const createService = async (payload) => {
    const existingService = await prisma.service.findFirst({
        where: {
            name: {
                equals: payload.name,
                mode: "insensitive",
            },
            deletedAt: null,
        },
    });
    if (existingService) {
        throw new AppError(httpStatus.CONFLICT, "A service with this name already exists");
    }
    const service = await prisma.service.create({
        data: {
            name: payload.name,
            description: payload.description,
            basePrice: payload.basePrice,
            isActive: true,
        },
    });
    return service;
};
const getAllServices = async (query) => {
    const { page, limit, search, isActive, sortBy, sortOrder, } = query;
    const skip = (page - 1) * limit;
    const where = {
        deletedAt: null,
        ...(search
            ? {
                OR: [
                    {
                        name: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    {
                        description: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                ],
            }
            : {}),
        ...(isActive !== undefined
            ? {
                isActive,
            }
            : {}),
    };
    const [services, total] = await prisma.$transaction([
        prisma.service.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder,
            },
        }),
        prisma.service.count({
            where,
        }),
    ]);
    return {
        data: services,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
const getServiceById = async (serviceId) => {
    const service = await prisma.service.findFirst({
        where: {
            id: serviceId,
            deletedAt: null,
        },
    });
    if (!service) {
        throw new AppError(httpStatus.NOT_FOUND, "Service not found");
    }
    return service;
};
const updateService = async (serviceId, payload) => {
    const existingService = await prisma.service.findFirst({
        where: {
            id: serviceId,
            deletedAt: null,
        },
    });
    if (!existingService) {
        throw new AppError(httpStatus.NOT_FOUND, "Service not found");
    }
    if (payload.name) {
        const duplicateService = await prisma.service.findFirst({
            where: {
                id: {
                    not: serviceId,
                },
                name: {
                    equals: payload.name,
                    mode: "insensitive",
                },
                deletedAt: null,
            },
        });
        if (duplicateService) {
            throw new AppError(httpStatus.CONFLICT, "A service with this name already exists");
        }
    }
    const service = await prisma.service.update({
        where: {
            id: serviceId,
        },
        data: {
            ...(payload.name !== undefined && {
                name: payload.name,
            }),
            ...(payload.description !== undefined && {
                description: payload.description,
            }),
            ...(payload.basePrice !== undefined && {
                basePrice: payload.basePrice,
            }),
            ...(payload.isActive !== undefined && {
                isActive: payload.isActive,
            }),
        },
    });
    return service;
};
const deleteService = async (serviceId) => {
    const existingService = await prisma.service.findFirst({
        where: {
            id: serviceId,
            deletedAt: null,
        },
    });
    if (!existingService) {
        throw new AppError(httpStatus.NOT_FOUND, "Service not found");
    }
    const service = await prisma.service.update({
        where: {
            id: serviceId,
        },
        data: {
            deletedAt: new Date(),
            isActive: false,
        },
    });
    return service;
};
export const serviceService = {
    createService,
    getAllServices,
    getServiceById,
    updateService,
    deleteService,
};
