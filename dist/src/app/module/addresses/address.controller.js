import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { addressService } from "./address.service.js";
const createAddress = catchAsync(async (req, res) => {
    const userId = req.user?.userId;
    const result = await addressService.createAddress(userId, req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Address created successfully",
        data: result,
    });
});
const getMyAddresses = catchAsync(async (req, res) => {
    const userId = req.user?.userId;
    const result = await addressService.getMyAddresses(userId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Addresses retrieved successfully",
        data: result,
    });
});
const getAddressById = catchAsync(async (req, res) => {
    const userId = req.user?.userId;
    const { addressId } = req.params;
    const result = await addressService.getAddressById(userId, addressId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Address retrieved successfully",
        data: result,
    });
});
const updateAddress = catchAsync(async (req, res) => {
    const userId = req.user?.userId;
    const { addressId } = req.params;
    const result = await addressService.updateAddress(userId, addressId, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Address updated successfully",
        data: result,
    });
});
const deleteAddress = catchAsync(async (req, res) => {
    const userId = req.user?.userId;
    const { addressId } = req.params;
    const result = await addressService.deleteAddress(userId, addressId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Address deleted successfully",
        data: result,
    });
});
export const addressController = {
    createAddress,
    getMyAddresses,
    getAddressById,
    updateAddress,
    deleteAddress,
};
