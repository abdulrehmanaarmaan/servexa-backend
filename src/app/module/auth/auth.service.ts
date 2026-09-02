/** biome-ignore-all lint/style/useConst: <explanation> */
import bcrypt from "bcryptjs";
import crypto from "crypto";
// import ejs from "ejs";
// import type { TokenPayload } from "google-auth-library";
import type { JwtPayload, SignOptions } from "jsonwebtoken";
import path from "path";
import {
	UserRole,
} from "../../../generated/prisma/enums";
import config from "../../config";
// import { googleClient } from "../../lib/googleAuth";
// import { transporter } from "../../lib/nodemailer";
import { prisma } from "../../lib/prisma";
// import { AppError } from "../../utils/AppError";
import { jwtUtils } from "../../utils/jwt";
import type {
    IGoogleLoginPayload,
    ILoginUserPayload,
	IRegisterPatientPayload,
	IRequestUser
} from "./auth.interface";
import httpStatus from "http-status";
import { AppError } from "../../utils/appError";
import { googleClient } from "../../lib/googleAuth";
import { TokenPayload } from "google-auth-library/build/src/auth/loginticket";

const registerPatient = async (payload: IRegisterPatientPayload) => {
	const { name, password, phone} = payload;

	const email = payload.email.trim().toLowerCase();

	const isUserExists = await prisma.user.findUnique({
		where: { email },
	});

	if (isUserExists) {
		throw new AppError(httpStatus.CONFLICT, "User with this email already exists.");
	}

	const hashedPassword = await bcrypt.hash(password, 8);

    const createdUser = await prisma.user.create({
		data: {
			email,
			passwordHash: hashedPassword,
			role: UserRole.CUSTOMER,
			customer: {
				create: {
					name,
					phone,
				},
			},
		},
		omit: { passwordHash: true },
		include: { customer: true },
	});

    const jwtPayload = {
		userId: createdUser.id,
		email: createdUser.email,
		role: createdUser.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return {
		createdUser,
		accessToken,
		refreshToken,
	};
};

const loginUser = async (payload: ILoginUserPayload) => {

	const { password } = payload;
	const email = payload.email.trim().toLowerCase();

	const user = await prisma.user.findUnique({
		where: { email },
	});

	if (!user) {
		// throw new Error("User not found");
		throw new AppError(httpStatus.NOT_FOUND, "User Not Found.")
	}

	if (!user.isActive) {
		throw new AppError(httpStatus.FORBIDDEN, "User is inactive.");
	}

	const isPasswordMatched = await bcrypt.compare(
		password,
		user.passwordHash as string,
	);

	if (!isPasswordMatched) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials.");
	}

	const jwtPayload = {
		userId: user.id,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return {
		accessToken,
		refreshToken,
	};
};

const getMe = async (user: IRequestUser) => {

	const isUserExists = await prisma.user.findUnique({
		where: {
			id: user.userId,
		},
		include: {
			customer: true,
		},
		omit: {
			passwordHash: true,
		},
	});

	if (!isUserExists) {
		throw new AppError(httpStatus.NOT_FOUND, "User not found.");
	}

	return isUserExists;
};

const refreshToken = async (token: string) => {
	const verifiedRefreshToken = jwtUtils.verifyToken(
		token,
		config.jwt_refresh_secret,
	);

	if (!verifiedRefreshToken.success || !verifiedRefreshToken.data) {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			config.node_env === "development"
				? verifiedRefreshToken.error
				: "Invalid refresh token",
		);
	}

	const data = verifiedRefreshToken.data as JwtPayload;

	const user = await prisma.user.findUnique({
		where: { id: data.userId },
	});

	if (!user || !user.isActive) {
		throw new AppError(httpStatus.UNAUTHORIZED, "User is inactive or not found.");
	}

	const jwtPayload = {
		userId: user.id,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return {
		accessToken,
		refreshToken,
	};
};

const googleLogin = async (payload: IGoogleLoginPayload) => {
	let googleIdTokenPayload: TokenPayload | null | undefined = null;
	try {
		const ticket = await googleClient.verifyIdToken({
			idToken: payload.idToken,
			audience: config.google_client_id,
		});

		googleIdTokenPayload = ticket.getPayload();
	} catch (error) {
		console.log("Google id token verification failed.", error);
		throw new AppError(httpStatus.UNAUTHORIZED, "Invalid or expired Google id token.");
	}

	if (!googleIdTokenPayload) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Invalid or expired Google id token.");
	}

	if (!googleIdTokenPayload.email) {
		throw new AppError(httpStatus.BAD_REQUEST, "Google email not found.");
	}
	if (!googleIdTokenPayload.name) {
		throw new AppError(httpStatus.BAD_REQUEST, "Google email user name not found.");
	}

	const customerWithGoogleAuth = await prisma.user.findUnique({
		where: {
			email: googleIdTokenPayload.email,
			role: UserRole.CUSTOMER,
			googleId: googleIdTokenPayload.sub,
		},
	});

	let user = customerWithGoogleAuth;

	if (!customerWithGoogleAuth) {
		const customerWithCredentials = await prisma.user.findUnique({
			where: {
				email: googleIdTokenPayload.email,
				role: UserRole.CUSTOMER,
			},
		});

		if (customerWithCredentials) {
			if (!customerWithCredentials.isActive) {
				throw new AppError(httpStatus.FORBIDDEN, "Email not verified.");
			}

			user = await prisma.user.update({
				where: {
					id: customerWithCredentials.id,
				},

				data: {
					googleId: googleIdTokenPayload.sub,
				},
			});
		} else {
			// Google Register
			user = await prisma.user.create({
				data: {
					email: googleIdTokenPayload.email,
					role: UserRole.CUSTOMER,
					googleId: googleIdTokenPayload.sub,
					customer: {
						create: {
							name: googleIdTokenPayload.name,
							email: googleIdTokenPayload.email,
						},
					},
				},
			});
		}
	}

	if (!user) {
		throw new AppError(httpStatus.NOT_FOUND, "User not found.");
	}

	if (!user.isActive) {
		throw new AppError(httpStatus.FORBIDDEN, "User is not active.");
	}

	const jwtPayload = {
		userId: user.id,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return {
		accessToken,
		refreshToken,
	};
};

export const AuthService = {
	registerPatient,
	loginUser,
	getMe,
	refreshToken,
	googleLogin
};
