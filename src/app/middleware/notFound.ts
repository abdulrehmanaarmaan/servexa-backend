import type { Request, Response } from "express";
import httpStatus from "http-status";
import { sendResponse } from "../utils/sendResponse.js";

export const notFound = (req: Request, res: Response) => {

	sendResponse(res, {
		statusCode: httpStatus.NOT_FOUND,
		message: "Route not found",
		path: req.originalUrl,
		date: new Date(),
	})
};
