import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/appError.js";
const getMyAvailabilities = async (user) => {
    const technician = await prisma.technician.findUnique({
        where: {
            userId: user.userId,
        },
    });
    if (!technician) {
        throw new AppError(404, "Technician profile not found.");
    }
    return prisma.availability.findMany({
        where: {
            technicianId: technician.id,
        },
        orderBy: {
            startAt: "asc",
        },
    });
};
const createAvailability = async (user, payload) => {
    const technician = await prisma.technician.findUnique({
        where: {
            userId: user.userId,
        },
    });
    if (!technician) {
        throw new AppError(404, "Technician profile not found.");
    }
    if (!technician.isActive) {
        throw new AppError(403, "Inactive technicians cannot manage availability.");
    }
    const overlapping = await prisma.availability.findFirst({
        where: {
            technicianId: technician.id,
            startAt: {
                lt: payload.endAt,
            },
            endAt: {
                gt: payload.startAt,
            },
        },
    });
    if (overlapping) {
        throw new AppError(409, "Availability period overlaps with an existing period.");
    }
    return prisma.availability.create({
        data: {
            technicianId: technician.id,
            ...payload,
        },
    });
};
const updateAvailability = async (user, availabilityId, payload) => {
    const technician = await prisma.technician.findUnique({
        where: {
            userId: user.userId,
        },
    });
    if (!technician) {
        throw new AppError(404, "Technician profile not found.");
    }
    const availability = await prisma.availability.findFirst({
        where: {
            id: availabilityId,
            technicianId: technician.id,
        },
    });
    if (!availability) {
        throw new AppError(404, "Availability record not found.");
    }
    const startAt = payload.startAt ?? availability.startAt;
    const endAt = payload.endAt ?? availability.endAt;
    if (endAt <= startAt) {
        throw new AppError(400, "End time must be later than start time.");
    }
    const overlapping = await prisma.availability.findFirst({
        where: {
            technicianId: technician.id,
            id: {
                not: availabilityId,
            },
            startAt: {
                lt: endAt,
            },
            endAt: {
                gt: startAt,
            },
        },
    });
    if (overlapping) {
        throw new AppError(409, "Availability period overlaps with an existing period.");
    }
    return prisma.availability.update({
        where: {
            id: availabilityId,
        },
        data: {
            ...payload,
            startAt,
            endAt,
        },
    });
};
const deleteAvailability = async (user, availabilityId) => {
    const technician = await prisma.technician.findUnique({
        where: {
            userId: user.userId,
        },
    });
    if (!technician) {
        throw new AppError(404, "Technician profile not found.");
    }
    const availability = await prisma.availability.findFirst({
        where: {
            id: availabilityId,
            technicianId: technician.id,
        },
    });
    if (!availability) {
        throw new AppError(404, "Availability record not found.");
    }
    return prisma.availability.delete({
        where: {
            id: availabilityId,
        },
    });
};
export const availabilityService = {
    getMyAvailabilities,
    createAvailability,
    updateAvailability,
    deleteAvailability,
};
