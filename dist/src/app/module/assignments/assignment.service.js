import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/appError.js";
const getAssignments = async (workOrderId) => {
    const workOrder = await prisma.workOrder.findUnique({
        where: {
            id: workOrderId,
        },
    });
    if (!workOrder) {
        throw new AppError(404, "Work order not found.");
    }
    return prisma.assignment.findMany({
        where: {
            workOrderId,
        },
        include: {
            technician: {
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
            },
        },
        orderBy: {
            assignedAt: "desc",
        },
    });
};
const createAssignment = async (workOrderId, technicianId, user) => {
    return prisma.$transaction(async (tx) => {
        const workOrder = await tx.workOrder.findUnique({
            where: {
                id: workOrderId,
            },
        });
        if (!workOrder) {
            throw new AppError(404, "Work order not found.");
        }
        if (workOrder.status === "COMPLETED" ||
            workOrder.status === "CANCELLED") {
            throw new AppError(400, "Cannot assign a technician to this work order.");
        }
        const technician = await tx.technician.findUnique({
            where: {
                id: technicianId,
            },
        });
        if (!technician || !technician.isActive) {
            throw new AppError(400, "Active technician not found.");
        }
        const existingAssignment = await tx.assignment.findFirst({
            where: {
                workOrderId,
                technicianId,
                unassignedAt: null,
            },
        });
        if (existingAssignment) {
            throw new AppError(409, "Technician is already assigned to this work order.");
        }
        const assignment = await tx.assignment.create({
            data: {
                workOrderId,
                technicianId,
            },
            include: {
                technician: true,
            },
        });
        if (workOrder.status === "OPEN" ||
            workOrder.status === "SCHEDULED") {
            await tx.workOrder.update({
                where: {
                    id: workOrderId,
                },
                data: {
                    status: "ASSIGNED",
                },
            });
            await tx.jobStatusHistory.create({
                data: {
                    workOrderId,
                    fromStatus: workOrder.status,
                    toStatus: "ASSIGNED",
                    changedById: user.userId,
                    reason: "Technician assigned",
                },
            });
        }
        await tx.auditLog.create({
            data: {
                actorId: user.userId,
                action: "TECHNICIAN_ASSIGNED",
                entity: "Assignment",
                entityId: assignment.id,
                newValue: {
                    workOrderId,
                    technicianId,
                },
            },
        });
        return assignment;
    });
};
const unassignTechnician = async (workOrderId, assignmentId, user) => {
    return prisma.$transaction(async (tx) => {
        const assignment = await tx.assignment.findFirst({
            where: {
                id: assignmentId,
                workOrderId,
            },
        });
        if (!assignment) {
            throw new AppError(404, "Assignment not found.");
        }
        if (assignment.unassignedAt) {
            throw new AppError(400, "Technician is already unassigned.");
        }
        const updatedAssignment = await tx.assignment.update({
            where: {
                id: assignmentId,
            },
            data: {
                unassignedAt: new Date(),
            },
        });
        await tx.auditLog.create({
            data: {
                actorId: user.userId,
                action: "TECHNICIAN_UNASSIGNED",
                entity: "Assignment",
                entityId: assignment.id,
                oldValue: {
                    technicianId: assignment.technicianId,
                },
                newValue: {
                    unassignedAt: updatedAssignment.unassignedAt,
                },
            },
        });
        return updatedAssignment;
    });
};
export const assignmentService = {
    getAssignments,
    createAssignment,
    unassignTechnician,
};
