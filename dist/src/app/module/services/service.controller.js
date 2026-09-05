import { serviceService } from "./service.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from "http-status";
const createService = async (req, res) => {
    const result = await serviceService.createService(req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Service created successfully.",
        data: result,
    });
};
const getAllServices = async (req, res) => {
    const query = res.locals.validated.query;
    const result = await serviceService.getAllServices(query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Services retrieved successfully.",
        data: result.data,
        meta: result.meta
    });
};
const getServiceById = async (req, res) => {
    const { serviceId } = req.params;
    const result = await serviceService.getServiceById(serviceId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Service retrieved successfully.",
        data: result,
    });
};
const updateService = async (req, res) => {
    const { serviceId } = req.params;
    const result = await serviceService.updateService(serviceId, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Service updated successfully",
        data: result,
    });
};
const deleteService = async (req, res) => {
    const { serviceId } = req.params;
    const result = await serviceService.deleteService(serviceId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Service deleted successfully",
        data: result,
    });
};
export const serviceController = {
    createService,
    getAllServices,
    getServiceById,
    updateService,
    deleteService,
};
