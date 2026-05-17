import { get, post } from "./client";
import { normalizeAngolaPhone } from "./helpers";

export interface InitiatePaymentResponse {
  id: string;
  userId: string;
  cycleId: string;
  amount: number;
  phoneNumber: string;
  provider: string;
  status: string;
  providerReference: string;
  paidAt?: string | null;
}

export interface PaymentDetails {
  id: string;
  userId?: string;
  cycleId?: string;
  reference?: string;
  amount: number;
  description?: string;
  status: string;
  phoneNumber: string;
  provider?: string;
  providerReference?: string;
  createdAt: string;
  paidAt?: string | null;
}

export interface PaymentWebhookPayload {
  providerReference: string;
  success: boolean;
  failureReason?: string | null;
}

export async function initiatePayment(
  cycleId: string,
  phoneNumber: string,
): Promise<InitiatePaymentResponse> {
  return post<InitiatePaymentResponse>("/api/payments/initiate", {
    cycleId,
    phoneNumber: normalizeAngolaPhone(phoneNumber),
  });
}

export async function getPayment(paymentId: string): Promise<PaymentDetails> {
  return get<PaymentDetails>(`/api/payments/${paymentId}`);
}

export async function confirmUssd404PaymentWebhook(
  payload: PaymentWebhookPayload,
): Promise<PaymentDetails> {
  return post<PaymentDetails>("/api/payments/webhook/ussd404", payload);
}
