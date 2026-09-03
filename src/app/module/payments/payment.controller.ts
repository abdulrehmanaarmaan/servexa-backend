import type { Request, Response } from "express";

import { paymentService } from "./payment.service.js";
import { IRequestUser } from "../auth/auth.interface.js";

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

	res.status(201).json({
		success: true,
		message: "Payment initiated successfully",
		data: result,
	});
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
		`${process.env.CLIENT_URL}/payment/result?status=${
			result.success ? "success" : "failed"
		}`,
	);
};

export const paymentController = {
	createPayment,
	bkashCallback,
};