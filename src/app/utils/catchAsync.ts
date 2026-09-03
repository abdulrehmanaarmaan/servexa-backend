import { NextFunction, Request, RequestHandler, Response } from "express";
import { sendResponse } from "./sendResponse.js";
import httpStatus from "http-status"

export const catchAsync = (fn: RequestHandler) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			await fn(req, res, next);
		} catch (error) {

			sendResponse(res, {
				success: false,
				statusCode: httpStatus.INTERNAL_SERVER_ERROR,
				message: "Failed to register user",
				error: (error as Error).message
			})
			
			next(error);
		}
	};
};
