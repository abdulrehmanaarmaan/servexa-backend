import { availabilityService } from "./availability.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from "http-status";
const getMyAvailabilities = async (req, res) => {
    const user = req.user;
    const result = await availabilityService.getMyAvailabilities(user);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Availabilities retrieved successfully",
        data: result,
    });
};
const createAvailability = async (req, res) => {
    const user = req.user;
    const result = await availabilityService.createAvailability(user, req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Availability created successfully",
        data: result,
    });
};
const updateAvailability = async (req, res) => {
    const user = req.user;
    const result = await availabilityService.updateAvailability(user, req.params.availabilityId, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Availability updated successfully",
        data: result
    });
};
const deleteAvailability = async (req, res) => {
    const user = req.user;
    const result = await availabilityService.deleteAvailability(user, req.params.availabilityId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Availability deleted successfully",
        data: result
    });
};
export const availabilityController = {
    getMyAvailabilities,
    createAvailability,
    updateAvailability,
    deleteAvailability,
};
