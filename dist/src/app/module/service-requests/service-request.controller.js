import { serviceRequestService, } from "./service-request.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from "http-status";
const createServiceRequest = async (req, res) => {
    const user = req.user;
    const result = await serviceRequestService.createServiceRequest(req.body, user);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Service request created successfully",
        data: result,
    });
};
const getServiceRequest = async (req, res) => {
    const { serviceRequestId } = req.params;
    const user = req.user;
    const result = await serviceRequestService.getServiceRequestById(serviceRequestId, user);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Service request retrieved successfully",
        data: result,
    });
};
const getMyServiceRequests = async (req, res) => {
    const user = req.user;
    const result = await serviceRequestService.getMyServiceRequests(user, res.locals.validated.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Service requests retrieved successfully",
        data: result.data,
        meta: result.meta
    });
};
const getAllServiceRequests = async (req, res) => {
    const result = await serviceRequestService.getAllServiceRequests(res.locals.validated.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Service requests retrieved successfully",
        data: result.data,
        meta: result.meta
    });
};
const updateServiceRequest = async (req, res) => {
    const { serviceRequestId } = req.params;
    const user = req.user;
    const result = await serviceRequestService.updateServiceRequest(serviceRequestId, req.body, user);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Service request updated successfully",
        data: result,
    });
};
const updateServiceRequestStatus = async (req, res) => {
    const { serviceRequestId } = req.params;
    const user = req.user;
    const result = await serviceRequestService.updateServiceRequestStatus(serviceRequestId, req.body, user);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Service request status updated successfully",
        data: result,
    });
};
const cancelServiceRequest = async (req, res) => {
    const { serviceRequestId } = req.params;
    const user = req.user;
    const result = await serviceRequestService.cancelServiceRequest(serviceRequestId, user);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Service request cancelled successfully",
        data: result,
    });
};
export const serviceRequestController = {
    createServiceRequest,
    getServiceRequest,
    getMyServiceRequests,
    getAllServiceRequests,
    updateServiceRequest,
    updateServiceRequestStatus,
    cancelServiceRequest,
};
