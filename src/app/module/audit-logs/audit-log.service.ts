import { prisma } from "../../lib/prisma.js";

interface ICreateAuditLog {
  actorId?: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string;
  userAgent?: string;
}

const createAuditLog = async (payload: ICreateAuditLog) => {
  return prisma.auditLog.create({
    data: {
      actorId: payload.actorId,
      action: payload.action,
      entity: payload.entity,
      entityId: payload.entityId,
      oldValue: payload.oldValue as object | undefined,
      newValue: payload.newValue as object | undefined,
      ipAddress: payload.ipAddress,
      userAgent: payload.userAgent,
    },
  });
};

export { createAuditLog };