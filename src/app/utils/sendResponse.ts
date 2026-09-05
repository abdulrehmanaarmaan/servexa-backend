import type { Response } from "express";

type TMeta = {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
};

type TResponseData<X, Y> = {
	success?: boolean;
	statusCode: number;
	path?: string;
	date?: Date;
	message: string;
	data?: X;
	meta?: TMeta;
	error?: Y
};

export const sendResponse = <X, Y>(res: Response, data: TResponseData<X, Y>) => {
	res.status(data.statusCode).json({
		success: data.success,
		statusCode: data.statusCode,
		message: data.message,
		data: data.data,
		meta: data.meta,
	});
};
