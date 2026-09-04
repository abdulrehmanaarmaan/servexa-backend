import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { IRequestUser } from "./auth.interface.js";
import { AppError } from "../../utils/appError.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { authService } from "./auth.service.js";
import config from "../../config/index.js";


const registerCustomer = catchAsync(async (req: Request, res: Response) => {
	
	const payload = await req.body;

	const result = await authService.registerCustomer(payload);

    const { accessToken, refreshToken, createdUser } = result;

	res.cookie("accessToken", accessToken, {
		httpOnly: true,
		secure: false,
		sameSite: "none",
		maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
	});
	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		secure: false,
		sameSite: "none",
		maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
	});

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "User registered successfully",
		data: {
			accessToken,
			refreshToken,
			createdUser
		},
	});
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
	const payload = await req.body;
	const result = await authService.loginUser(payload);
	const { accessToken, refreshToken } = result;

	res.cookie("accessToken", accessToken, {
		httpOnly: true,
		secure: false,
		sameSite: "none",
		maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
	});
	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		secure: false,
		sameSite: "none",
		maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
	});

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User logged in successfully",
		data: {
			accessToken,
			refreshToken,
		},
	});
});

const getMe = catchAsync(async (req: Request, res: Response) => {
	const user = req.user as unknown as IRequestUser;

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

const refreshToken = catchAsync(async (req: Request, res: Response) => {
	if (!req.cookies.refreshToken) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Refresh token is missing");
	}
	const result = await authService.refreshToken(req.cookies.refreshToken);
	const { accessToken, refreshToken: newRefreshToken } = result;

	res.cookie("accessToken", accessToken, {
		httpOnly: true,
		secure: false,
		sameSite: "none",
		maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
	});
	res.cookie("refreshToken", newRefreshToken, {
		httpOnly: true,
		secure: false,
		sameSite: "none",
		maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
	});

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

const googleLogin = catchAsync(
  async (
    req: Request,
    res: Response,
  ) => {
    const {
      authorizationUrl,
      state,
    } = authService.getGoogleAuthorizationUrl();

    res.cookie(
      "googleOAuthState",
      state,
      {
        httpOnly: true,
        secure:
          config.node_env === "production",
        sameSite:
          config.node_env === "production"
            ? "none"
            : "lax",
        maxAge: 1000 * 60 * 10,
      },
    );

    res.redirect(authorizationUrl);
  },
);

const googleCallback = catchAsync(
  async (
    req: Request,
    res: Response,
  ) => {
    const { code, state } = req.query;

    const storedState =
      req.cookies.googleOAuthState;

    if (
      typeof code !== "string" ||
      typeof state !== "string"
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Invalid Google authentication callback",
      );
    }

    if (
      !storedState ||
      storedState !== state
    ) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Invalid Google authentication state.",
      );
    }

    res.clearCookie(
      "googleOAuthState",
    );

    const result =
      await authService.googleCallback(
        code,
      );

    res.cookie(
      "accessToken",
      result.accessToken,
      {
        httpOnly: true,
        secure:
          config.node_env === "production",
        sameSite:
          config.node_env === "production"
            ? "none"
            : "lax",
        maxAge: 1000 * 60 * 60,
      },
    );

    res.cookie(
      "refreshToken",
      result.refreshToken,
      {
        httpOnly: true,
        secure:
          config.node_env === "production",
        sameSite:
          config.node_env === "production"
            ? "none"
            : "lax",
        maxAge:
          1000 *
          60 *
          60 *
          24 *
          7,
      },
    );

    res.redirect(
      `${config.client_url}/auth/success`,
    );
  },
);

export const authController = {
	registerCustomer,
	loginUser,
	getMe,
	refreshToken,
	googleLogin,
	googleCallback
};
