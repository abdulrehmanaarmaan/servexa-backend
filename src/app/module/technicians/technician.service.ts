import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/appError.js";
import type { IRequestUser } from "../auth/auth.interface.js";
import type {
    ITechnicianQuery,
    IUpdateTechnician,
} from "./technician.interface.js";

const getMyTechnicianProfile = async (
    user: IRequestUser,
) => {
    const technician = await prisma.technician.findUnique({
        where: {
            userId: user.userId,
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    role: true,
                    isActive: true,
                },
            },
        },
    });

    if (!technician) {
        throw new AppError(404, "Technician profile not found.");
    }

    return technician;
};

const updateMyTechnicianProfile = async (
    user: IRequestUser,
    payload: IUpdateTechnician,
) => {
    const technician = await prisma.technician.findUnique({
        where: {
            userId: user.userId,
        },
    });

    if (!technician) {
        throw new AppError(404, "Technician profile not found.");
    }

    const updatedTechnician = await prisma.technician.update({
        where: {
            id: technician.id,
        },
        data: payload,
    });

    return updatedTechnician;
};

const getTechnicianById = async (
    technicianId: string,
) => {
    const technician = await prisma.technician.findUnique({
        where: {
            id: technicianId,
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    role: true,
                    isActive: true,
                },
            },
            availabilities: {
                where: {
                    status: "AVAILABLE",
                },
                orderBy: {
                    startAt: "asc",
                },
            },
        },
    });

    if (!technician) {
        throw new AppError(404, "Technician not found.");
    }

    return technician;
};

const getAllTechnicians = async (
    query: ITechnicianQuery,
) => {
    const {
        page,
        limit,
        search,
        isActive,
        sortBy,
        sortOrder,
    } = query;

    const skip = (page - 1) * limit;

    const where = {
        ...(isActive !== undefined && {
            isActive,
        }),
        ...(search && {
            OR: [
                {
                    name: {
                        contains: search,
                        mode: "insensitive" as const,
                    },
                },
                {
                    employeeCode: {
                        contains: search,
                        mode: "insensitive" as const,
                    },
                },
                {
                    phone: {
                        contains: search,
                        mode: "insensitive" as const,
                    },
                },
            ],
        }),
    };

    const [technicians, total] = await prisma.$transaction([
        prisma.technician.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        isActive: true,
                    },
                },
            },
        }),
        prisma.technician.count({
            where,
        }),
    ]);

    return {
        data: technicians,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
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
        const updatedTechnician =
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

        await tx.auditLog.create({
            data: {
                actorId: null,
                action: "TECHNICIAN_STATUS_UPDATED",
                entity: "Technician",
                entityId: technicianId,
                oldValue: {
                    isActive: technician.isActive,
                },
                newValue: {
                    isActive,
                },
            },
        });

        return updatedTechnician;
    });
};

export const technicianService = {
    getMyTechnicianProfile,
    updateMyTechnicianProfile,
    getTechnicianById,
    getAllTechnicians,
    updateTechnicianStatus,
};