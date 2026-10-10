import { prisma } from "../../lib/prisma.js";
import { createBkashPayment, executeBkashPayment, } from "../../../integrations/payment/bkash/bkash.service.js";
import config from "../../config/index.js";
const getMyPayments = async (user) => {
    const customer = await prisma.customer.findUnique({
        where: {
            userId: user.userId,
        },
        select: {
            id: true,
        },
    });
    if (!customer) {
        throw new Error("Customer profile not found.");
    }
    const payments = await prisma.payment.findMany({
        where: {
            invoice: {
                workOrder: {
                    customerId: customer.id,
                },
            },
        },
        include: {
            invoice: {
                select: {
                    id: true,
                    total: true,
                    status: true,
                    workOrder: {
                        select: {
                            id: true
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    return payments;
};
const createPayment = async (invoiceId, user) => {
    const customer = await prisma.customer.findUnique({
        where: {
            userId: user.userId,
        },
    });
    if (!customer) {
        throw new Error("Customer profile not found.");
    }
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
    if (invoice.workOrder.customerId !== customer.id) {
        throw new Error("You are not allowed to pay this invoice.");
    }
    if (invoice.status !== "ISSUED" &&
        invoice.status !== "PARTIALLY_PAID") {
        throw new Error("This invoice is not payable.");
    }
    const existingPendingPayment = await prisma.payment.findFirst({
        where: {
            invoiceId: invoice.id,
            status: "PENDING",
        },
    });
    if (existingPendingPayment) {
        throw new Error("A payment for this invoice is already pending.");
    }
    const payment = await prisma.payment.create({
        data: {
            invoiceId: invoice.id,
            amount: invoice.total,
            currency: "BDT",
            provider: "BKASH",
            status: "PENDING",
        },
    });
    try {
        const amount = Number(invoice.total);
        if (!Number.isFinite(amount) || amount < 1) {
            throw new Error("Invoices below ৳1 cannot be paid online.");
        }
        // ...then use it when calling bKash:
        const bkashPayment = await createBkashPayment({
            amount: amount.toFixed(2),
            payerReference: customer.id,
            merchantInvoiceNumber: payment.id,
            callbackURL: config.bkash_callback_url,
        });
        console.log("bKash amount:", invoice.total.toString());
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
    if (payment.status === "PAID") {
        return {
            success: true,
            message: "Payment already processed",
        };
    }
    if (status === "cancel") {
        await markPaymentCancelled(payment.id);
        return {
            success: false,
            message: "Payment cancelled",
        };
    }
    if (status === "failure") {
        await markPaymentFailed(payment.id);
        return {
            success: false,
            message: "Payment failed",
        };
    }
    const bkashResult = await executeBkashPayment(paymentId);
    if (bkashResult.status !== "Completed") {
        await markPaymentFailed(payment.id);
        return {
            success: false,
            message: "Payment could not be verified",
        };
    }
    if (bkashResult.amount &&
        Number(bkashResult.amount) !== Number(payment.amount)) {
        await markPaymentFailed(payment.id);
        throw new Error("Payment amount mismatch");
    }
    if (bkashResult.paymentId !== payment.gatewayReference) {
        await markPaymentFailed(payment.id);
        throw new Error("Payment reference mismatch");
    }
    await markPaymentSuccess(payment.id, bkashResult.transactionId, bkashResult.rawResponse);
    return {
        success: true,
        message: "Payment completed successfully",
    };
};
export const paymentService = {
    getMyPayments,
    createPayment,
    handleBkashCallback,
};
