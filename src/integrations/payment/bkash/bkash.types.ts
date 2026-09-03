export interface IBkashCreatePaymentInput {
  amount: string;
  payerReference: string;
  merchantInvoiceNumber: string;
  callbackURL: string;
}

export interface IBkashCreatePaymentResult {
  paymentId: string;
  paymentUrl: string;
  merchantInvoiceNumber: string;
  rawResponse: unknown;
}

export interface IBkashExecutePaymentResult {
  paymentId: string;
  transactionId?: string;
  status: string;
  amount?: string;
  merchantInvoiceNumber?: string;
  rawResponse: unknown;
}