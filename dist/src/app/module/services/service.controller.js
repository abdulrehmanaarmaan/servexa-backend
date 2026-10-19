import httpStatus from "http-status";
import { sendResponse } from "../../utils/sendResponse.js";
import { serviceService } from "./service.service.js";
import { AppError } from "../../utils/appError.js";
const createService = async (req, res) => {
    const result = await serviceService.createService(req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Service created successfully.",
        data: result,
    });
};
// 2) add this function above createService
const uploadServiceImage = async (req, res) => {
    if (!req.file) {
        throw new AppError(httpStatus.BAD_REQUEST, "Please select an image");
    }
    const result = await serviceService.uploadServiceImage(req.file);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Image uploaded successfully.",
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
        data: result
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
        message: "Service updated successfully.",
        data: result,
    });
};
const deleteService = async (req, res) => {
    const { serviceId } = req.params;
    const result = await serviceService.deleteService(serviceId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Service deleted successfully.",
        data: result,
    });
};
export const serviceController = {
    createService,
    uploadServiceImage,
    getAllServices,
    getServiceById,
    updateService,
    deleteService,
};
