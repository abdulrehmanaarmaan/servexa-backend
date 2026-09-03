import config from "../../../app/config/index.js";
import {
	IBkashCreatePaymentInput,
	IBkashCreatePaymentResult,
	IBkashExecutePaymentResult,
} from "./bkash.types.js";

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

export const getBkashIdToken = async (): Promise<string> => {
	if (cachedToken && Date.now() < tokenExpiresAt) {
		return cachedToken;
	}

	const response = await fetch(
		`${config.bkash_base_url}/tokenized/checkout/token/grant`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				username: config.bkash_username,
				password: config.bkash_password,
			},
			body: JSON.stringify({
				app_key: config.bkash_app_key,
				app_secret: config.bkash_app_secret,
			}),
		},
	);

	const data = await response.json();

	if (!response.ok || !data.id_token) {
		throw new Error(
			data.statusMessage ?? "Failed to obtain bKash ID token",
		);
	}

	cachedToken = data.id_token;

	tokenExpiresAt =
		Date.now() + ((data.expires_in ?? 300) - 30) * 1000;

	return cachedToken!;
};

export const createBkashPayment = async (
	input: IBkashCreatePaymentInput,
): Promise<IBkashCreatePaymentResult> => {
	const idToken = await getBkashIdToken();

	const response = await fetch(
		`${config.bkash_base_url}/tokenized/checkout/create`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Authorization: idToken,
				"X-App-Key": config.bkash_app_key,
			},
			body: JSON.stringify({
				mode: "0011",
				payerReference: input.payerReference,
				callbackURL: input.callbackURL,
				amount: input.amount,
				currency: "BDT",
				intent: "sale",
				merchantInvoiceNumber:
					input.merchantInvoiceNumber,
			}),
		},
	);

	const data = await response.json();

	if (!response.ok || !data.paymentID) {
		throw new Error(
			data.statusMessage ?? "Failed to create bKash payment",
		);
	}

	return {
		paymentId: data.paymentID,
		paymentUrl: data.bkashURL,
		merchantInvoiceNumber:
			data.merchantInvoiceNumber ??
			input.merchantInvoiceNumber,
		rawResponse: data,
	};
};

export const executeBkashPayment = async (
	paymentId: string,
): Promise<IBkashExecutePaymentResult> => {
	const idToken = await getBkashIdToken();

	const response = await fetch(
		`${config.bkash_base_url}/tokenized/checkout/execute`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Authorization: idToken,
				"X-App-Key": config.bkash_app_key,
			},
			body: JSON.stringify({
				paymentID: paymentId,
			}),
		},
	);

	const data = await response.json();

	if (!response.ok) {
		throw new Error(
			data.statusMessage ?? "Failed to execute bKash payment",
		);
	}

	return {
		paymentId: data.paymentID,
		transactionId: data.trxID,
		status: data.transactionStatus,
		amount: data.amount,
		merchantInvoiceNumber: data.merchantInvoiceNumber,
		rawResponse: data,
	};
};