import httpStatus from "http-status";
import { prisma } from "../../lib/prisma.js";
import { deleteServiceImage, isValidServiceImage, uploadServiceImage as uploadToCloudinary, } from "../../lib/cloudinary.js";
import { AppError } from "../../utils/appError.js";
const assertValidImagePair = (imageUrl, imagePublicId) => {
    if (!imageUrl && !imagePublicId)
        return;
    if (!imageUrl ||
        !imagePublicId ||
        !isValidServiceImage(imageUrl, imagePublicId)) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid service image");
    }
};
const uploadServiceImage = async (file) => {
    try {
        const result = await uploadToCloudinary(file.buffer);
        return {
            imageUrl: result.secure_url,
            imagePublicId: result.public_id,
        };
    }
    catch (error) {
        console.error("Cloudinary upload failed:", error);
        throw new AppError(httpStatus.BAD_GATEWAY, "Image upload failed. Please try again.");
    }
};
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
    assertValidImagePair(payload.imageUrl, payload.imagePublicId);
    const service = await prisma.service.create({
        data: {
            name: payload.name,
            description: payload.description,
            basePrice: payload.basePrice,
            imageUrl: payload.imageUrl ?? null,
            imagePublicId: payload.imagePublicId ?? null,
            isActive: true,
        },
    });
    return service;
};
const getAllServices = async (query) => {
    const { page, limit, search, isActive, sortBy, sortOrder } = query;
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
        ...(isActive !== undefined ? { isActive } : {}),
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
        prisma.service.count({ where }),
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
    const isChangingImage = payload.imageUrl !== undefined || payload.imagePublicId !== undefined;
    if (isChangingImage) {
        assertValidImagePair(payload.imageUrl, payload.imagePublicId);
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
            ...(isChangingImage && {
                imageUrl: payload.imageUrl ?? null,
                imagePublicId: payload.imagePublicId ?? null,
            }),
        },
    });
    // Remove the old Cloudinary asset only AFTER the database update succeeded.
    if (isChangingImage &&
        existingService.imagePublicId &&
        existingService.imagePublicId !== service.imagePublicId) {
        await deleteServiceImage(existingService.imagePublicId);
    }
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
    // Soft delete: the image is intentionally kept so the record stays intact.
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
    uploadServiceImage,
    createService,
    getAllServices,
    getServiceById,
    updateService,
    deleteService,
};
