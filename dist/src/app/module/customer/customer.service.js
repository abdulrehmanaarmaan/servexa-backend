import httpStatus from "http-status";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/appError.js";
const getCustomerProfile = async (user) => {
    const customerProfile = await prisma.customer.findUnique({
        where: {
            userId: user.userId,
        },
        include: {
            addresses: true,
            serviceRequests: true,
            workOrders: true
        }
    });
    if (!customerProfile) {
        throw new AppError(httpStatus.NOT_FOUND, "Customer profile not found.");
    }
    return customerProfile;
};
const updateCustomerProfile = async (updateProfile, user) => {
    const customerProfile = await prisma.customer.findUnique({
        where: {
            userId: user?.userId,
        }
    });
    if (!customerProfile) {
        throw new AppError(httpStatus.NOT_FOUND, "Customer profile not found.");
    }
    if (!updateProfile || Object.keys(updateProfile).length === 0) {
        throw new AppError(httpStatus.BAD_REQUEST, "No fields provided to update.");
    }
    const hasChanges = Object.entries(updateProfile).some(([key, value]) => customerProfile[key] !== value);
    if (!hasChanges) {
        return { data: customerProfile, changed: false };
    }
    const updatedProfile = await prisma.customer.update({
        where: {
            userId: user?.userId,
        },
        data: updateProfile
    });
    return { data: updatedProfile, changed: true };
};
export const customerService = {
    getCustomerProfile,
    updateCustomerProfile
};
