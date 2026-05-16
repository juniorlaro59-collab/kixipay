import { get, post } from "./client";

export interface InitiatePaymentResponse {
  success: boolean;
  message: string;
  transactionReference?: string;
}

export interface PaymentDetails {
  id: string;
  reference: string;
  amount: number;
  description: string;
  status: string;
  phoneNumber: string;
  createdAt: string;
  paidAt?: string;
}

export async function initiatePayment(
  cycleId: string,
  phoneNumber: string,
): Promise<InitiatePaymentResponse> {
  return post<InitiatePaymentResponse>("/api/payments/initiate", {
    cycleId,
    phoneNumber,
  });
}

export async function getPayment(paymentId: string): Promise<PaymentDetails> {
  return get<PaymentDetails>(`/api/payments/${paymentId}`);
}
