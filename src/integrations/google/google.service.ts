import crypto from "node:crypto";

import config from "../../app/config/index.js";
import {
  googleOAuth2Client,
} from "./google.config.js";

export const generateGoogleAuthUrl = () => {
  const state = crypto.randomBytes(32).toString("hex");

  const authorizationUrl =
    googleOAuth2Client.generateAuthUrl({
      access_type: "offline",

      scope: [
        "openid",
        "email",
        "profile",
      ],

      state,
    });

  return {
    authorizationUrl,
    state,
  };
};

export const exchangeGoogleCode = async (
  code: string,
) => {
  const { tokens } =
    await googleOAuth2Client.getToken(code);

  if (!tokens.id_token) {
    throw new Error(
      "Google ID token was not returned",
    );
  }

  return tokens;
};

export const verifyGoogleIdToken = async (
  idToken: string,
) => {
  const ticket =
    await googleOAuth2Client.verifyIdToken({
      idToken,
      audience: config.google_client_id,
    });

  return ticket.getPayload();
};