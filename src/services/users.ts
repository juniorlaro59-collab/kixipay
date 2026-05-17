import { get, post } from "./client";

export interface ApiUser {
  id: string;
  fullName: string;
  phoneNumber: string;
  biNumber?: string;
  score: number;
  level: string | number;
  role: string | number;
  pendingDebt: number;
}

export interface ApiScore {
  id: string;
  fullName: string;
  score: number;
  level: string;
}

export async function getCurrentUser(): Promise<ApiUser> {
  return get<ApiUser>("/api/Users/me");
}

export async function getMyScore(): Promise<ApiScore> {
  return get<ApiScore>("/api/Users/me/score");
}

export async function applyScoreEvent(
  eventType: string,
): Promise<{ success: boolean; message: string }> {
  return post(`/api/Users/me/score-events/${eventType}`, {});
}
