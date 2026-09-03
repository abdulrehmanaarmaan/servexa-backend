import { OAuth2Client } from "google-auth-library";
import config from "../../app/config/index.js";
export const googleOAuth2Client = new OAuth2Client(config.google_client_id, config.google_client_secret, config.google_callback_url);
