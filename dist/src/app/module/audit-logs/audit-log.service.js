import { prisma } from "../../lib/prisma.js";
const createAuditLog = async (payload) => {
    return prisma.auditLog.create({
        data: {
            actorId: payload.actorId,
            action: payload.action,
            entity: payload.entity,
            entityId: payload.entityId,
            oldValue: payload.oldValue,
            newValue: payload.newValue,
            ipAddress: payload.ipAddress,
            userAgent: payload.userAgent,
        },
    });
};
export { createAuditLog };
