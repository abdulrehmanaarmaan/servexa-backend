import httpStatus from "http-status";
import { Prisma } from "../../generated/prisma/client.js";
import config from "../config/index.js";
import { AppError } from "../utils/appError.js";
export const globalErrorHandler = async (err, _req, res, _next) => {
    if (config.node_env === "development") {
        console.error("Error from Global Error Handler:", err);
    }
    else {
        console.error("Production error:", err);
    }
    let statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    let errorMessage = "Something went wrong. Please try again.";
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        errorMessage = err.message;
    }
    else if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = httpStatus.BAD_REQUEST;
        errorMessage =
            "You have provided incorrect field types or missing fields.";
    }
    else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
            statusCode = httpStatus.BAD_REQUEST;
            errorMessage = "Duplicate record already exists.";
        }
        else if (err.code === "P2003") {
            statusCode = httpStatus.BAD_REQUEST;
            errorMessage =
                "The requested operation violates a related record constraint.";
        }
        else if (err.code === "P2025") {
            statusCode = httpStatus.NOT_FOUND;
            errorMessage =
                "The requested record was not found.";
        }
    }
    else if (err instanceof Prisma.PrismaClientInitializationError) {
        statusCode = httpStatus.SERVICE_UNAVAILABLE;
        errorMessage =
            "The service is temporarily unavailable. Please try again later.";
    }
    else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
        statusCode = httpStatus.INTERNAL_SERVER_ERROR;
        errorMessage =
            "Something went wrong while processing your request.";
    }
    const response = {
        success: false,
        statusCode,
        message: errorMessage,
    };
    if (config.node_env === "development") {
        response.name =
            err instanceof Error
                ? err.name
                : "UnknownError";
        response.error = err;
        response.stack =
            err instanceof Error
                ? err.stack
                : undefined;
    }
    res.status(statusCode).json(response);
};
