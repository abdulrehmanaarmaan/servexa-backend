import { invoiceService } from "./invoice.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from "http-status";
const createInvoice = async (req, res) => {
    const { workOrderId } = req.params;
    const user = req.user;
    const result = await invoiceService.createInvoice(workOrderId, await req.body, user);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Invoice created successfully",
        data: result,
    });
};
const getInvoice = async (req, res) => {
    const { invoiceId } = req.params;
    const user = req.user;
    const result = await invoiceService.getInvoiceById(invoiceId, user);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Invoice retrieved successfully",
        data: result,
    });
};
const getMyInvoices = async (req, res) => {
    const user = req.user;
    const query = res.locals.validated.query;
    const result = await invoiceService.getMyInvoices(user, query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Invoices retrieved successfully",
        data: result.data,
        meta: result.meta
    });
};
const getAllInvoices = async (req, res) => {
    const query = res.locals.validated.query;
    const result = await invoiceService.getAllInvoices(query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Invoices retrieved successfully",
        data: result.data,
        meta: result.meta
    });
};
const updateInvoice = async (req, res) => {
    const { invoiceId } = req.params;
    const user = req.user;
    const result = await invoiceService.updateInvoice(invoiceId, req.body, user);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Invoice updated successfully",
        data: result,
    });
};
export const invoiceController = {
    createInvoice,
    getInvoice,
    getMyInvoices,
    getAllInvoices,
    updateInvoice,
};
