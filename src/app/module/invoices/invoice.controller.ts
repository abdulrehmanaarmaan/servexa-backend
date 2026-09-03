import type { Request, Response } from "express";

import type { IRequestUser } from "../auth/auth.interface.js";
import { invoiceService } from "./invoice.service.js";

const createInvoice = async (
    req: Request,
    res: Response,
) => {
    const { workOrderId } = req.params;

    const user = req.user as IRequestUser;

    const result =await invoiceService.createInvoice(
            workOrderId as string,
            await req.body,
            user,
        );

    res.status(201).json({
        success: true,
        message: "Invoice created successfully",
        data: result,
    });
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

    res.status(200).json({
        success: true,
        message: "Invoice retrieved successfully",
        data: result,
    });
};

// const getMyInvoices = async (
//     req: Request,
//     res: Response,
// ) => {
//     const user = req.user as IRequestUser;

//     const result =
//         await invoiceService.getMyInvoices(
//             user,
//             req.query as unknown as {
//                 page: number;
//                 limit: number;
//                 status?: string;
//                 sortBy:
//                 | "createdAt"
//                 | "issuedAt"
//                 | "dueAt"
//                 | "total";
//                 sortOrder: "asc" | "desc";
//             },
//         );

//     res.status(200).json({
//         success: true,
//         message: "Invoices retrieved successfully",
//         data: result.data,
//         meta: result.meta,
//     });
// };

// const getAllInvoices = async (
//     req: Request,
//     res: Response,
// ) => {
//     const result =
//         await invoiceService.getAllInvoices(
//             req.query as unknown as {
//                 page: number;
//                 limit: number;
//                 status?: string;
//                 sortBy:
//                 | "createdAt"
//                 | "issuedAt"
//                 | "dueAt"
//                 | "total";
//                 sortOrder: "asc" | "desc";
//             },
//         );

//     res.status(200).json({
//         success: true,
//         message: "Invoices retrieved successfully",
//         data: result.data,
//         meta: result.meta,
//     });
// };

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

    res.status(200).json({
        success: true,
        message: "Invoice updated successfully",
        data: result,
    });
};

export const invoiceController = {
    createInvoice,
    getInvoice,
    // getMyInvoices,
    // getAllInvoices,
    updateInvoice,
};