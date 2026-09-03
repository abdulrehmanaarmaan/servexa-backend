import { invoiceService } from "./invoice.service.js";
const createInvoice = async (req, res) => {
    const { workOrderId } = req.params;
    const user = req.user;
    const result = await invoiceService.createInvoice(workOrderId, await req.body, user);
    res.status(201).json({
        success: true,
        message: "Invoice created successfully",
        data: result,
    });
};
const getInvoice = async (req, res) => {
    const { invoiceId } = req.params;
    const user = req.user;
    const result = await invoiceService.getInvoiceById(invoiceId, user);
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
const updateInvoice = async (req, res) => {
    const { invoiceId } = req.params;
    const user = req.user;
    const result = await invoiceService.updateInvoice(invoiceId, req.body, user);
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
