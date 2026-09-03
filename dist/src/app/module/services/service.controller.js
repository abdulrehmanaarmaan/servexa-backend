import { serviceService } from "./service.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
const createService = async (req, res) => {
    const result = await serviceService.createService(req.body);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Service created successfully.",
        data: result,
    });
};
const getAllServices = async (req, res) => {
    const result = await serviceService.getAllServices(req.query);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Services retrieved successfully.",
        data: result,
    });
};
const getServiceById = async (req, res) => {
    const { serviceId } = req.params;
    const result = await serviceService.getServiceById(serviceId);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Service retrieved successfully.",
        data: result,
    });
};
const updateService = async (req, res) => {
    const { serviceId } = req.params;
    const result = await serviceService.updateService(serviceId, req.body);
    res.status(200).json({
        success: true,
        message: "Service updated successfully",
        data: result,
    });
};
const deleteService = async (req, res) => {
    const { serviceId } = req.params;
    const result = await serviceService.deleteService(serviceId);
    res.status(200).json({
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
