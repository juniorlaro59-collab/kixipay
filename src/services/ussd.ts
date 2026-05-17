import { post } from "./client";

export interface UssdSessionPayload {
  sessionId: string;
  phoneNumber: string;
  serviceCode: string;
  text: string;
}

export async function sendUssdSession(payload: UssdSessionPayload): Promise<string> {
  return post<string>("/api/ussd/session", payload);
}
