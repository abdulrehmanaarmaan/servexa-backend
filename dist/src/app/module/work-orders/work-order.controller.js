import { workOrderService } from "./work-order.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
const createWorkOrder = async (req, res) => {
    const { serviceRequestId } = req.params;
    const user = req.user;
    const result = await workOrderService.createWorkOrder(serviceRequestId, req.body, user);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Work order created successfully",
        data: result,
    });
};
const getWorkOrder = async (req, res) => {
    const { workOrderId } = req.params;
    const user = req.user;
    const result = await workOrderService.getWorkOrderById(workOrderId, user);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Work order retrieved successfully",
        data: result,
    });
};
const getMyWorkOrders = async (req, res) => {
    const user = req.user;
    const result = await workOrderService.getMyWorkOrders(user, req.query);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Work orders retrieved successfully",
        data: result,
    });
};
const getMyTechnicianWorkOrders = async (req, res) => {
    const user = req.user;
    const result = await workOrderService.getMyTechnicianWorkOrders(user, req.query);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Assigned work orders retrieved successfully",
        data: result.data,
        meta: result.meta
    });
};
const getAllWorkOrders = async (req, res) => {
    const result = await workOrderService.getAllWorkOrders(req.query);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Work order retrieved successfully",
        data: result.data,
        meta: result.meta
    });
};
const updateWorkOrder = async (req, res) => {
    const { workOrderId } = req.params;
    const user = req.user;
    const result = await workOrderService.updateWorkOrder(workOrderId, req.body, user);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Work order updated successfully",
        data: result,
    });
};
const updateWorkOrderStatus = async (req, res) => {
    const { workOrderId } = req.params;
    const user = req.user;
    const result = await workOrderService.updateWorkOrderStatus(workOrderId, req.body, user);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Work order status updated successfully",
        data: result,
    });
};
const scheduleWorkOrder = async (req, res) => {
    const { workOrderId } = req.params;
    const user = req.user;
    const result = await workOrderService.scheduleWorkOrder(workOrderId, req.body, user);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Work order scheduled successfully",
        data: result,
    });
};
export const workOrderController = {
    createWorkOrder,
    getWorkOrder,
    getMyWorkOrders,
    getMyTechnicianWorkOrders,
    getAllWorkOrders,
    updateWorkOrder,
    updateWorkOrderStatus,
    scheduleWorkOrder,
};
