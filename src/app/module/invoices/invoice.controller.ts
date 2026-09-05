import type { Request, Response } from "express";

import type { IRequestUser } from "../auth/auth.interface.js";
import { invoiceService } from "./invoice.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { IInvoiceQuery } from "./invoice.interface.js";
import httpStatus from "http-status"

const createInvoice = async (
    req: Request,
    res: Response,
) => {
    const { workOrderId } = req.params;

    const user = req.user as IRequestUser;

    const result = await invoiceService.createInvoice(
        workOrderId as string,
        await req.body,
        user,
    );

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Invoice created successfully",
        data: result,
    })
};

const getInvoice = async (
    req: Request,
    res: Response,
) => {
    const { invoiceId } = req.params;

    const user = req.user as IRequestUser;

    const result =
        await invoiceService.getInvoiceById(
            invoiceId as string,
            user,
        );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Invoice retrieved successfully",
        data: result,
    })
};

const getMyInvoices = async (
    req: Request,
    res: Response,
) => {
    const user = req.user as IRequestUser;

      const query =
  res.locals.validated.query as IInvoiceQuery;

    const result =
        await invoiceService.getMyInvoices(
            user,
            query
        );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Invoices retrieved successfully",
        data: result.data,
        meta: result.meta
    })
};

const getAllInvoices = async (
    req: Request,
    res: Response,
) => {

    const query =
  res.locals.validated.query as IInvoiceQuery;

    const result =
        await invoiceService.getAllInvoices(
            query
        );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Invoices retrieved successfully",
        data: result.data,
        meta: result.meta
    })
};

const updateInvoice = async (
    req: Request,
    res: Response,
) => {
    const { invoiceId } = req.params;

    const user = req.user as IRequestUser;

    const result =
        await invoiceService.updateInvoice(
            invoiceId as string,
            req.body,
            user,
        );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Invoice updated successfully",
        data: result,
    })
};

export const invoiceController = {
    createInvoice,
    getInvoice,
    getMyInvoices,
    getAllInvoices,
    updateInvoice,
};