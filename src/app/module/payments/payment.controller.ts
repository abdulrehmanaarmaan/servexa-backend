import type { Request, Response } from "express";

import { paymentService } from "./payment.service.js";
import { IRequestUser } from "../auth/auth.interface.js";
import config from "../../config/index.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from "http-status"

const createPayment = async (
	req: Request,
	res: Response,
) => {
	const { invoiceId } = req.params;

	const user = req.user as IRequestUser;

	const result = await paymentService.createPayment(
		invoiceId as string,
		user,
	);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Payment initiated successfully",
		data: result,
	  })
};

const bkashCallback = async (
	req: Request,
	res: Response,
) => {
	const paymentID = req.query.paymentID as string;
	const status = req.query.status as string;

	const result =
		await paymentService.handleBkashCallback(
			paymentID,
			status,
		);

	res.redirect(
		`${config.client_url}/payment/result?status=${
			result.success ? "success" : "failed"
		}`,
	);
};

export const paymentController = {
	createPayment,
	bkashCallback,
};