/** biome-ignore-all lint/style/useConst: <explanation> */
import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/appError.js";
import { UserRole } from "../../../generated/prisma/enums.js";
import { jwtUtils } from "../../utils/jwt.js";
import config from "../../config/index.js";
import { googleService } from "../../../integrations/google/google.service.js";
const registerCustomer = async (payload) => {
    const { name, password, phone } = payload;
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
    const accessToken = jwtUtils.createToken(jwtPayload, config.jwt_access_secret, config.jwt_access_expires_in);
    const refreshToken = jwtUtils.createToken(jwtPayload, config.jwt_refresh_secret, config.jwt_refresh_expires_in);
    return {
        createdUser,
        accessToken,
        refreshToken,
    };
};
const loginUser = async (payload) => {
    const { password } = payload;
    const email = payload.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User Not Found.");
    }
    if (!user.isActive) {
        throw new AppError(httpStatus.FORBIDDEN, "User is inactive.");
    }
    const isPasswordMatched = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordMatched) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials.");
    }
    const jwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
    };
    const accessToken = jwtUtils.createToken(jwtPayload, config.jwt_access_secret, config.jwt_access_expires_in);
    const refreshToken = jwtUtils.createToken(jwtPayload, config.jwt_refresh_secret, config.jwt_refresh_expires_in);
    return {
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
        },
        accessToken,
        refreshToken
    };
};
const getMe = async (user) => {
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
const refreshToken = async (token) => {
    const verifiedRefreshToken = jwtUtils.verifyToken(token, config.jwt_refresh_secret);
    if (!verifiedRefreshToken.success || !verifiedRefreshToken.data) {
        throw new AppError(httpStatus.UNAUTHORIZED, config.node_env === "development"
            ? verifiedRefreshToken.error
            : "Invalid refresh token");
    }
    const data = verifiedRefreshToken.data;
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
    const accessToken = jwtUtils.createToken(jwtPayload, config.jwt_access_secret, config.jwt_access_expires_in);
    const refreshToken = jwtUtils.createToken(jwtPayload, config.jwt_refresh_secret, config.jwt_refresh_expires_in);
    return {
        accessToken,
        refreshToken,
    };
};
const googleLogin = async (payload) => {
    let googlePayload;
    try {
        googlePayload = await googleService.verifyGoogleIdToken(payload.idToken);
    }
    catch (error) {
        console.error("Google ID token verification failed:", error);
        throw new AppError(httpStatus.UNAUTHORIZED, "Invalid Google authentication.");
    }
    if (!googlePayload.email_verified) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Google email is not verified.");
    }
    if (!googlePayload.name) {
        throw new AppError(httpStatus.BAD_REQUEST, "Google account name not found.");
    }
    const googleId = googlePayload.sub;
    const email = googlePayload.email.trim().toLowerCase();
    const name = googlePayload.name;
    let user = await prisma.user.findFirst({
        where: {
            googleId,
            role: UserRole.CUSTOMER,
        },
    });
    if (!user) {
        const existingUser = await prisma.user.findFirst({
            where: {
                email,
                role: UserRole.CUSTOMER,
            },
        });
        if (existingUser) {
            if (!existingUser.isActive) {
                throw new AppError(httpStatus.FORBIDDEN, "User is not active.");
            }
            user = await prisma.user.update({
                where: {
                    id: existingUser.id,
                },
                data: {
                    googleId,
                },
            });
        }
        else {
            user = await prisma.user.create({
                data: {
                    email,
                    role: UserRole.CUSTOMER,
                    googleId,
                    customer: {
                        create: {
                            name,
                        },
                    },
                },
            });
        }
    }
    if (!user.isActive) {
        throw new AppError(httpStatus.FORBIDDEN, "User is not active.");
    }
    const jwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
    };
    const accessToken = jwtUtils.createToken(jwtPayload, config.jwt_access_secret, config.jwt_access_expires_in);
    const refreshToken = jwtUtils.createToken(jwtPayload, config.jwt_refresh_secret, config.jwt_refresh_expires_in);
    return {
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
        },
        accessToken,
        refreshToken,
    };
};
export const authService = {
    registerCustomer,
    loginUser,
    getMe,
    refreshToken,
    googleLogin
};
