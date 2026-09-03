import httpStatus from "http-status";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
export const validateRequest = (schemas) => {
    return catchAsync((req, res, next) => {
        const requestParts = [
            ["body", req.body, schemas.body],
            ["params", req.params, schemas.params],
            ["query", req.query, schemas.query],
        ];
        for (const [part, payload, schema] of requestParts) {
            if (!schema)
                continue;
            const result = schema.safeParse(payload);
            if (!result.success) {
                const message = result.error.issues
                    .map((issue) => `${part}.${issue.path.join(".")}: ${issue.message}`)
                    .join(", ");
                throw new AppError(httpStatus.BAD_REQUEST, message);
            }
            if (part === "body") {
                req.body = result.data;
            }
            else if (part === "params") {
                Object.assign(req.params, result.data);
            }
            else if (part === "query") {
                Object.assign(req.query, result.data);
            }
        }
        next();
    });
};
