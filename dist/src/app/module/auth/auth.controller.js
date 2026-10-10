import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { AppError } from "../../utils/appError.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { authService } from "./auth.service.js";
import config from "../../config/index.js";
const getAuthCookieOptions = (maxAge) => ({
    httpOnly: true,
    secure: config.node_env === "production",
    sameSite: (config.node_env === "production" ? "none" : "lax"),
    path: "/",
    maxAge,
});
const registerCustomer = catchAsync(async (req, res) => {
    const payload = req.body;
    const result = await authService.registerCustomer(payload);
    const { accessToken, refreshToken, createdUser } = result;
    res.cookie("accessToken", accessToken, getAuthCookieOptions(1000 * 60 * 60 * 24));
    res.cookie("refreshToken", refreshToken, getAuthCookieOptions(1000 * 60 * 60 * 24 * 7));
    res.cookie("servexa_role", createdUser.role, getAuthCookieOptions(1000 * 60 * 60 * 24));
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "User registered successfully",
        data: {
            createdUser,
        },
    });
});
const loginUser = catchAsync(async (req, res) => {
    const payload = req.body;
    const result = await authService.loginUser(payload);
    const { user, accessToken, refreshToken } = result;
    res.cookie("accessToken", accessToken, getAuthCookieOptions(1000 * 60 * 60 * 24));
    res.cookie("refreshToken", refreshToken, getAuthCookieOptions(1000 * 60 * 60 * 24 * 7));
    res.cookie("servexa_role", user.role, getAuthCookieOptions(1000 * 60 * 60 * 24));
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User logged in successfully",
        data: {
            user,
        },
    });
});
const getMe = catchAsync(async (req, res) => {
    const user = req.user;
    if (!user) {
        throw new AppError(httpStatus.UNAUTHORIZED, "User information is missing in the request.");
    }
    const result = await authService.getMe(user);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User profile fetched successfully",
        data: result,
    });
});
const refreshToken = catchAsync(async (req, res) => {
    const currentRefreshToken = req.cookies.refreshToken;
    if (!currentRefreshToken) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Refresh token is missing");
    }
    const result = await authService.refreshToken(currentRefreshToken);
    const { accessToken, refreshToken: newRefreshToken, } = result;
    res.cookie("accessToken", accessToken, getAuthCookieOptions(1000 * 60 * 60 * 24));
    res.cookie("refreshToken", newRefreshToken, getAuthCookieOptions(1000 * 60 * 60 * 24 * 7));
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "New tokens generated successfully",
        data: {
            accessToken,
            refreshToken: newRefreshToken,
        },
    });
});
const googleLogin = catchAsync(async (req, res) => {
    const payload = req.body;
    const result = await authService.googleLogin(payload);
    const { user, accessToken, refreshToken } = result;
    res.cookie("accessToken", accessToken, getAuthCookieOptions(1000 * 60 * 60 * 24));
    res.cookie("refreshToken", refreshToken, getAuthCookieOptions(1000 * 60 * 60 * 24 * 7));
    res.cookie("servexa_role", user.role, getAuthCookieOptions(1000 * 60 * 60 * 24));
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Google login successful",
        data: {
            user
        }
    });
});
const logoutUser = catchAsync(async (_req, res) => {
    const cookieOptions = {
        httpOnly: true,
        secure: config.node_env === "production",
        sameSite: (config.node_env === "production" ? "none" : "lax"),
        path: "/",
    };
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);
    res.clearCookie("servexa_role", cookieOptions);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Logout successful",
        data: null,
    });
});
export const authController = {
    registerCustomer,
    loginUser,
    getMe,
    refreshToken,
    googleLogin,
    logoutUser,
};
