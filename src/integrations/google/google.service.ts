import { OAuth2Client } from "google-auth-library";
import config from "../../app/config/index.js";

const googleClient = new OAuth2Client();

export interface GoogleUserPayload {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
}

const verifyGoogleIdToken = async (
  idToken: string,
): Promise<GoogleUserPayload> => {
  if (!idToken) {
    throw new Error("Google ID token is required.");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: config.google_client_id,
    maxExpiry: 60 * 60 * 24, // keep default behavior explicit
  });

  const payload = ticket.getPayload();

  if (!payload) {
    throw new Error("Invalid Google ID token.");
  }

  if (!payload.sub) {
    throw new Error("Google account ID is missing.");
  }

  if (!payload.email) {
    throw new Error("Google email is missing.");
  }

  return {
    sub: payload.sub,
    email: payload.email,
    email_verified: payload.email_verified === true,
    name: payload.name,
    picture: payload.picture,
  };
};

export const googleService = {
  verifyGoogleIdToken,
};