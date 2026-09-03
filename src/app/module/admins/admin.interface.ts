import type { z } from "zod";

import {
    adminUserQuerySchema,
    adminStatusSchema,
    adminAuditLogQuerySchema,
} from "./admin.validation.js";

export type IAdminUserQuery = z.infer<
    typeof adminUserQuerySchema
>;

export type IAdminStatus = z.infer<
    typeof adminStatusSchema
>;

export type IAdminAuditLogQuery = z.infer<
    typeof adminAuditLogQuerySchema
>;