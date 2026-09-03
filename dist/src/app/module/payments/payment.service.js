import { prisma } from "../../lib/prisma.js";
import { createBkashPayment, executeBkashPayment } from "../../../integrations/payment/bkash/bkash.service.js";
import config from "../../config/index.js";
const createPayment = async (invoiceId, user) => {
    // ---------------------------------------
    // 1. Find the customer
    // ---------------------------------------
    const customer = await prisma.customer.findUnique({
        where: {
            userId: user.userId,
        },
    });
    if (!customer) {
        throw new Error("Customer profile not found.");
    }
    // ---------------------------------------
    // 2. Find the invoice
    // ---------------------------------------
    const invoice = await prisma.invoice.findUnique({
        where: {
            id: invoiceId,
        },
        include: {
            workOrder: true,
        },
    });
    if (!invoice) {
        throw new Error("Invoice not found.");
    }
    // ---------------------------------------
    // 3. Ownership check
    // ---------------------------------------
    if (invoice.workOrder.customerId !== customer.id) {
        throw new Error("You are not allowed to pay this invoice.");
    }
    // ---------------------------------------
    // 4. Invoice status check
    // ---------------------------------------
    if (invoice.status !== "ISSUED" &&
        invoice.status !== "PARTIALLY_PAID") {
        throw new Error("This invoice is not payable.");
    }
    // ---------------------------------------
    // 5. Check existing pending payment
    // ---------------------------------------
    const existingPendingPayment = await prisma.payment.findFirst({
        where: {
            invoiceId: invoice.id,
            status: "PENDING",
        },
    });
    if (existingPendingPayment) {
        throw new Error("A payment for this invoice is already pending.");
    }
    // ---------------------------------------
    // 6. Create Servexa payment
    // ---------------------------------------
    const payment = await prisma.payment.create({
        data: {
            invoiceId: invoice.id,
            // NEVER accept amount from frontend.
            amount: invoice.total,
            currency: "BDT",
            provider: "BKASH",
            status: "PENDING",
        },
    });
    // ---------------------------------------
    // 7. Call bKash
    // ---------------------------------------
    try {
        const bkashPayment = await createBkashPayment({
            amount: invoice.total.toString(),
            payerReference: customer.id,
            merchantInvoiceNumber: payment.id,
            callbackURL: config.bkash_callback_url,
        });
        // ---------------------------------------
        // 8. Save bKash information
        // ---------------------------------------
        const updatedPayment = await prisma.payment.update({
            where: {
                id: payment.id,
            },
            data: {
                gatewayReference: bkashPayment.paymentId,
                gatewayResponse: bkashPayment.rawResponse,
            },
        });
        return {
            paymentId: updatedPayment.id,
            paymentUrl: bkashPayment.paymentUrl,
        };
    }
    catch (error) {
        // ---------------------------------------
        // 9. bKash initialization failed
        // ---------------------------------------
        await prisma.payment.update({
            where: {
                id: payment.id,
            },
            data: {
                status: "FAILED",
            },
        });
        throw error;
    }
};
export const markPaymentSuccess = async (paymentId, transactionId, gatewayResponse) => {
    return prisma.$transaction(async (tx) => {
        const payment = await tx.payment.findUnique({
            where: {
                id: paymentId,
            },
        });
        if (!payment) {
            throw new Error("Payment not found");
        }
        // Idempotency
        if (payment.status === "PAID") {
            return payment;
        }
        const updatedPayment = await tx.payment.update({
            where: {
                id: paymentId,
            },
            data: {
                status: "PAID",
                transactionId,
                gatewayResponse: gatewayResponse,
                paidAt: new Date(),
            },
        });
        await tx.invoice.update({
            where: {
                id: payment.invoiceId,
            },
            data: {
                status: "PAID",
            },
        });
        await tx.auditLog.create({
            data: {
                actorId: null,
                action: "PAYMENT_COMPLETED",
                entity: "Payment",
                entityId: payment.id,
                oldValue: {
                    status: payment.status,
                },
                newValue: {
                    status: "PAID",
                    transactionId,
                },
            },
        });
        return updatedPayment;
    });
};
export const markPaymentFailed = async (paymentId) => {
    return prisma.payment.update({
        where: {
            id: paymentId,
        },
        data: {
            status: "FAILED",
        },
    });
};
export const markPaymentCancelled = async (paymentId) => {
    return prisma.payment.update({
        where: {
            id: paymentId,
        },
        data: {
            status: "CANCELLED",
        },
    });
};
export const handleBkashCallback = async (paymentId, status) => {
    // ---------------------------------------
    // 1. Find Servexa payment
    // ---------------------------------------
    const payment = await prisma.payment.findFirst({
        where: {
            gatewayReference: paymentId,
        },
        include: {
            invoice: true,
        },
    });
    if (!payment) {
        throw new Error("Payment not found");
    }
    // ---------------------------------------
    // 2. Idempotency
    // ---------------------------------------
    if (payment.status === "PAID") {
        return {
            success: true,
            message: "Payment already processed",
        };
    }
    // ---------------------------------------
    // 3. Customer cancelled payment
    // ---------------------------------------
    if (status === "cancel") {
        await markPaymentCancelled(payment.id);
        return {
            success: false,
            message: "Payment cancelled",
        };
    }
    // ---------------------------------------
    // 4. Customer payment failed
    // ---------------------------------------
    if (status === "failure") {
        await markPaymentFailed(payment.id);
        return {
            success: false,
            message: "Payment failed",
        };
    }
    // ---------------------------------------
    // 5. Verify/execute with bKash
    // ---------------------------------------
    const bkashResult = await executeBkashPayment(paymentId);
    // ---------------------------------------
    // 6. Do NOT trust callback alone
    // ---------------------------------------
    if (bkashResult.status !== "Completed") {
        await markPaymentFailed(payment.id);
        return {
            success: false,
            message: "Payment could not be verified",
        };
    }
    // ---------------------------------------
    // 7. Verify amount
    // ---------------------------------------
    if (bkashResult.amount &&
        Number(bkashResult.amount) !==
            Number(payment.amount)) {
        await markPaymentFailed(payment.id);
        throw new Error("Payment amount mismatch");
    }
    // ---------------------------------------
    // 8. Verify transaction reference
    // ---------------------------------------
    if (bkashResult.paymentId !==
        payment.gatewayReference) {
        await markPaymentFailed(payment.id);
        throw new Error("Payment reference mismatch");
    }
    // ---------------------------------------
    // 9. Mark payment successful
    // ---------------------------------------
    await markPaymentSuccess(payment.id, bkashResult.transactionId, bkashResult.rawResponse);
    return {
        success: true,
        message: "Payment completed successfully",
    };
};
export const paymentService = {
    createPayment,
    handleBkashCallback
};
