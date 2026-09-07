/** biome-ignore-all lint/style/useConst: <explanation> */
import bcrypt from "bcryptjs";
import type { JwtPayload, SignOptions } from "jsonwebtoken";
import httpStatus from "http-status";
import { ILoginUserPayload, IRegisterPatientPayload, IRequestUser } from "./auth.interface.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/appError.js";
import { UserRole } from "../../../generated/prisma/enums.js";
import { jwtUtils } from "../../utils/jwt.js";
import config from "../../config/index.js";
import { exchangeGoogleCode, generateGoogleAuthUrl, verifyGoogleIdToken } from "../../../integrations/google/google.service.js";


const registerCustomer = async (payload: IRegisterPatientPayload) => {
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

const getGoogleAuthorizationUrl = () => {
  return generateGoogleAuthUrl();
};

const googleCallback = async (
  code: string,
) => {
  let tokens;

  try {
    tokens = await exchangeGoogleCode(code);
  } catch (error) {
    console.error(
      "Google authorization code exchange failed:",
      error,
    );

    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Google authentication failed.",
    );
  }

  let googlePayload;

  try {
    googlePayload = await verifyGoogleIdToken(
      tokens.id_token!,
    );
  } catch (error) {
    console.error(
      "Google ID token verification failed:",
      error,
    );

    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Invalid Google authentication.",
    );
  }

  if (!googlePayload) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Invalid Google authentication.",
    );
  }

  if (!googlePayload.sub) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Google account ID not found.",
    );
  }

  if (!googlePayload.email) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Google email not found.",
    );
  }

  if (!googlePayload.email_verified) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Google email is not verified.",
    );
  }

  if (!googlePayload.name) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Google account name not found.",
    );
  }

  const googleId = googlePayload.sub;
  const email = googlePayload.email;
  const name = googlePayload.name;

  let user = await prisma.user.findFirst({
    where: {
      googleId,
      role: UserRole.CUSTOMER,
    },
  });

  if (!user) {
    const existingUser =
      await prisma.user.findFirst({
        where: {
          email,
          role: UserRole.CUSTOMER,
        },
      });

    if (existingUser) {
      if (!existingUser.isActive) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "User is not active.",
        );
      }

      user = await prisma.user.update({
        where: {
          id: existingUser.id,
        },
        data: {
          googleId,
        },
      });
    } else {
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

  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "User not found.",
    );
  }

  if (!user.isActive) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "User is not active.",
    );
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

export const authService = {
	registerCustomer,
	loginUser,
	getMe,
	refreshToken,
	getGoogleAuthorizationUrl,
	googleCallback
};
