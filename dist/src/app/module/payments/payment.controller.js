import { paymentService } from "./payment.service.js";
import config from "../../config/index.js";
const createPayment = async (req, res) => {
    const { invoiceId } = req.params;
    const user = req.user;
    const result = await paymentService.createPayment(invoiceId, user);
    res.status(201).json({
        success: true,
        message: "Payment initiated successfully.",
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
    createPayment,
    bkashCallback,
};
