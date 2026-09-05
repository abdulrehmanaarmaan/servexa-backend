import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/appError.js";
const getNotes = async (workOrderId, user) => {
    const workOrder = await prisma.workOrder.findUnique({
        where: {
            id: workOrderId,
        },
    });
    if (!workOrder) {
        throw new AppError(404, "Work order not found.");
    }
    if (user.role === "CUSTOMER") {
        const customer = await prisma.customer.findUnique({
            where: {
                userId: user.userId,
            },
        });
        if (!customer || workOrder.customerId !== customer.id) {
            throw new AppError(403, "Access denied.");
        }
    }
    if (user.role === "TECHNICIAN") {
        const technician = await prisma.technician.findUnique({
            where: {
                userId: user.userId,
            },
        });
        if (!technician) {
            throw new AppError(403, "Access denied.");
        }
        const assignment = await prisma.assignment.findFirst({
            where: {
                workOrderId,
                technicianId: technician.id,
                unassignedAt: null,
            },
        });
        if (!assignment) {
            throw new AppError(403, "Access denied.");
        }
    }
    return prisma.workOrderNote.findMany({
        where: {
            workOrderId,
            deletedAt: null,
        },
        orderBy: {
            createdAt: "asc",
        },
    });
};
const createNote = async (workOrderId, user, payload) => {
    const workOrder = await prisma.workOrder.findUnique({
        where: {
            id: workOrderId,
        },
    });
    if (!workOrder) {
        throw new AppError(404, "Work order not found.");
    }
    let authorId = user.userId;
    if (user.role === "CUSTOMER") {
        const customer = await prisma.customer.findUnique({
            where: {
                userId: user.userId,
            },
        });
        if (!customer || workOrder.customerId !== customer.id) {
            throw new AppError(403, "Access denied.");
        }
    }
    if (user.role === "TECHNICIAN") {
        const technician = await prisma.technician.findUnique({
            where: {
                userId: user.userId,
            },
        });
        if (!technician) {
            throw new AppError(403, "Access denied.");
        }
        const assignment = await prisma.assignment.findFirst({
            where: {
                workOrderId,
                technicianId: technician.id,
                unassignedAt: null,
            },
        });
        if (!assignment) {
            throw new AppError(403, "Access denied.");
        }
    }
    return prisma.workOrderNote.create({
        data: {
            workOrderId,
            authorId,
            content: payload.content,
        },
    });
};
const updateNote = async (noteId, user, payload) => {
    const note = await prisma.workOrderNote.findUnique({
        where: {
            id: noteId,
        },
    });
    if (!note || note.deletedAt) {
        throw new AppError(404, "Note not found.");
    }
    if (user.role !== "ADMIN" &&
        note.authorId !== user.userId) {
        throw new AppError(403, "You can only update your own note.");
    }
    return prisma.workOrderNote.update({
        where: {
            id: noteId,
        },
        data: {
            content: payload.content,
        },
    });
};
const deleteNote = async (noteId, user) => {
    const note = await prisma.workOrderNote.findUnique({
        where: {
            id: noteId,
        },
    });
    if (!note || note.deletedAt) {
        throw new AppError(404, "Note not found.");
    }
    if (user.role !== "ADMIN" &&
        note.authorId !== user.userId) {
        throw new AppError(403, "You can only delete your own note.");
    }
    return prisma.workOrderNote.update({
        where: {
            id: noteId,
        },
        data: {
            deletedAt: new Date(),
        },
    });
};
export const noteService = {
    getNotes,
    createNote,
    updateNote,
    deleteNote,
};
