import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { AppError } from "../../utils/appError.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { customerService } from "./customer.service.js";
const getMyCustomerProfile = catchAsync(async (req, res) => {
    const user = req.user;
    if (!user) {
        throw new AppError(httpStatus.UNAUTHORIZED, "User information is missing in the request.");
    }
    const result = await customerService.getCustomerProfile(user);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Customer profile fetched successfully",
        data: result,
    });
});
const updateMyCustomerProfile = catchAsync(async (req, res) => {
    const payload = await req.body;
    const user = req.user;
    const result = await customerService.updateCustomerProfile(payload, user);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.changed
            ? "Customer profile updated successfully"
            : "No changes detected. Profile is already up to date",
        data: result?.data,
    });
});
export const customerController = {
    getMyCustomerProfile,
    updateMyCustomerProfile,
};
