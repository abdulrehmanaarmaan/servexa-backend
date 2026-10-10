import httpStatus from "http-status";
import { paymentService } from "./payment.service.js";
import config from "../../config/index.js";
import { sendResponse } from "../../utils/sendResponse.js";
const getMyPayments = async (req, res) => {
    const user = req.user;
    const result = await paymentService.getMyPayments(user);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Payment history fetched successfully",
        data: result,
    });
};
const createPayment = async (req, res) => {
    const { invoiceId } = req.params;
    const user = req.user;
    const result = await paymentService.createPayment(invoiceId, user);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Payment initiated successfully",
        data: result,
    });
};
const bkashCallback = async (req, res) => {
    const paymentID = req.query.paymentID;
    const status = req.query.status;
    const result = await paymentService.handleBkashCallback(paymentID, status);
    res.redirect(`${config.client_url}/payment/result?status=${result.success ? "success" : "failed"}`);
};
export const paymentController = {
    getMyPayments,
    createPayment,
    bkashCallback,
};
