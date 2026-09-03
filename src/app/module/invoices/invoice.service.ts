import httpStatus from "http-status";

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/appError.js";

import type { IRequestUser } from "../auth/auth.interface.js";
import { CreateInvoiceInput, InvoiceQuery, UpdateInvoiceInput } from "./invoice.interface.js";

const generateInvoiceNumber = (): string => {
  const timestamp = Date.now();

  const random = Math.floor(
    1000 + Math.random() * 9000,
  );

  return `INV-${timestamp}-${random}`;
};

const createInvoice = async (
  workOrderId: string,
  payload: CreateInvoiceInput,
  user: IRequestUser,
) => {
  return prisma.$transaction(async (tx) => {
    const workOrder = await tx.workOrder.findUnique({
      where: {
        id: workOrderId,
      },
      include: {
        invoice: true,
      },
    });

    if (!workOrder) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        "Work order not found",
      );
    }

    if (workOrder.status !== "COMPLETED") {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Invoice can only be created for a completed work order",
      );
    }

    if (workOrder.invoice) {
      throw new AppError(
        httpStatus.CONFLICT,
        "Invoice already exists for this work order",
      );
    }

    const total = payload.subtotal + payload.tax;

    const invoice = await tx.invoice.create({
      data: {
        workOrderId: workOrder.id,

        invoiceNumber: generateInvoiceNumber(),

        subtotal: payload.subtotal,
        tax: payload.tax,
        total,

        status: "ISSUED",

        dueAt: payload.dueAt,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: user.userId,

        action: "INVOICE_CREATED",

        entity: "Invoice",

        entityId: invoice.id,

        newValue: {
          invoiceNumber: invoice.invoiceNumber,
          workOrderId: invoice.workOrderId,
          subtotal: invoice.subtotal.toString(),
          tax: invoice.tax.toString(),
          total: invoice.total.toString(),
          status: invoice.status,
        },
      },
    });

    return invoice;
  });
};

const getInvoiceById = async (
  invoiceId: string,
  user: IRequestUser,
) => {
  const invoice = await prisma.invoice.findUnique({
    where: {
      id: invoiceId,
    },
    include: {
      workOrder: {
        include: {
          customer: true,
          service: true,
          address: true,
        },
      },
      payments: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!invoice) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Invoice not found",
    );
  }

  /*
   * ADMIN can access any invoice.
   */
  if (user.role === "ADMIN") {
    return invoice;
  }

  /*
   * CUSTOMER can only access their own invoice.
   */
  if (user.role === "CUSTOMER") {
    const customer = await prisma.customer.findUnique({
      where: {
        userId: user.userId,
      },
    });

    if (!customer) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        "Customer profile not found",
      );
    }

    if (
      invoice.workOrder.customerId !== customer.id
    ) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not allowed to access this invoice",
      );
    }

    return invoice;
  }

  throw new AppError(
    httpStatus.FORBIDDEN,
    "You are not allowed to access this invoice",
  );
};

const getMyInvoices = async (
  user: IRequestUser,
  query: InvoiceQuery,
) => {
  const customer = await prisma.customer.findUnique({
    where: {
      userId: user.userId,
    },
  });

  if (!customer) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Customer profile not found",
    );
  }

  const {
    page,
    limit,
    status,
    sortBy,
    sortOrder,
  } = query;

  const skip = (page - 1) * limit;

  const where = {
    ...(status && {
      status,
    }),

    workOrder: {
      customerId: customer.id,
    },
  };

  const [invoices, total] =
    await prisma.$transaction([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,

        include: {
          workOrder: {
            include: {
              service: true,
            },
          },
        },

        orderBy: {
          [sortBy]: sortOrder,
        },
      }),

      prisma.invoice.count({
        where,
      }),
    ]);

  return {
    data: invoices,

    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getAllInvoices = async (
  query: InvoiceQuery,
) => {
  const {
    page,
    limit,
    status,
    sortBy,
    sortOrder,
  } = query;

  const skip = (page - 1) * limit;

  const where = {
    ...(status && {
      status,
    }),
  };

  const [invoices, total] =
    await prisma.$transaction([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,

        include: {
          workOrder: {
            include: {
              customer: true,
              service: true,
            },
          },
        },

        orderBy: {
          [sortBy]: sortOrder,
        },
      }),

      prisma.invoice.count({
        where,
      }),
    ]);

  return {
    data: invoices,

    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const updateInvoice = async (
  invoiceId: string,
  payload: UpdateInvoiceInput,
  user: IRequestUser,
) => {
  return prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findUnique({
      where: {
        id: invoiceId,
      },
    });

    if (!invoice) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        "Invoice not found",
      );
    }

    /*
     * Don't allow modification after payment.
     */
    if (
      invoice.status === "PAID" ||
      invoice.status === "PARTIALLY_PAID"
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Paid invoices cannot be modified",
      );
    }

    if (invoice.status === "VOID") {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Void invoices cannot be modified",
      );
    }

    const tax =
      payload.tax ?? Number(invoice.tax);

    const subtotal = Number(invoice.subtotal);

    const total = subtotal + tax;

    const updatedInvoice =
      await tx.invoice.update({
        where: {
          id: invoiceId,
        },

        data: {
          ...(payload.tax !== undefined && {
            tax: payload.tax,
          }),

          ...(payload.dueAt !== undefined && {
            dueAt: payload.dueAt,
          }),

          total,
        },
      });

    await tx.auditLog.create({
      data: {
        actorId: user.userId,

        action: "INVOICE_UPDATED",

        entity: "Invoice",

        entityId: invoice.id,

        oldValue: {
          tax: invoice.tax.toString(),
          total: invoice.total.toString(),
          dueAt: invoice.dueAt,
        },

        newValue: {
          tax: updatedInvoice.tax.toString(),
          total: updatedInvoice.total.toString(),
          dueAt: updatedInvoice.dueAt,
        },
      },
    });

    return updatedInvoice;
  });
};

export const invoiceService = {
  createInvoice,
  getInvoiceById,
  getMyInvoices,
  getAllInvoices,
  updateInvoice,
};