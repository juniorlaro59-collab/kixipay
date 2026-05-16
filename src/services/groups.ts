import { get, post, del } from "./client";
import type { Grupo } from "@/types";

export interface CurrentCycle {
  id: string;
  groupId: string;
  cycleNumber: number;
  beneficiaryName: string;
  deadlineDate: string;
  status: string;
  totalCollected: number;
  totalContributions: number;
  pendingContributions: number;
}

export interface CycleContribution {
  id: string;
  userName: string;
  amount: number;
  status: string;
  paidAt: string;
}

export async function getGrupo(): Promise<Grupo> {
  const grupos = await get<Grupo[]>("/api/Groups/my");
  return grupos[0];
}

export async function getCurrentCycle(groupId: string): Promise<CurrentCycle> {
  return get<CurrentCycle>(`/api/Cycles/group/${groupId}/current`);
}

export async function getContribuicoes(cycleId: string): Promise<CycleContribution[]> {
  return get<CycleContribution[]>(`/api/Cycles/${cycleId}/contributions`);
}

export async function contributeToCycle(
  cycleId: string,
  transactionReference?: string,
): Promise<{ success: boolean; message: string }> {
  return post("/api/Cycles/contribute", {
    cycleId,
    transactionReference: transactionReference || `MANUAL-${Date.now()}`,
  });
}

export type PaymentFrequency = "weekly" | "biweekly" | "monthly";

export async function createGroup(data: {
  name: string;
  contributionAmount: number;
  frequency: PaymentFrequency;
  maxMembers: number;
  guaranteeFundContribution: number;
}): Promise<Grupo> {
  return post<Grupo>("/api/Groups", data);
}

export async function getGroupById(groupId: string): Promise<Grupo> {
  return get<Grupo>(`/api/Groups/${groupId}`);
}

export async function leaveGroup(groupId: string): Promise<{ success: boolean; message: string }> {
  return del(`/api/Groups/${groupId}/leave`);
}

export async function startCycle(groupId: string): Promise<{ success: boolean; message: string }> {
  return post(`/api/Cycles/group/${groupId}/start`, {});
}

export async function getAllGroups(): Promise<Grupo[]> {
  return get<Grupo[]>("/api/Groups");
}

export async function getGroupJoinRequests(
  groupId: string,
): Promise<
  {
    id: string;
    userId: string;
    fullName: string;
    phoneNumber: string;
    status: string;
    createdAt: string;
  }[]
> {
  return get(`/api/Groups/${groupId}/join-requests`);
}

export async function approveJoinRequest(
  requestId: string,
): Promise<{ success: boolean; message: string }> {
  return post(`/api/Groups/join-requests/${requestId}/approve`, {});
}

export async function rejectJoinRequest(
  requestId: string,
  reason?: string,
): Promise<{ success: boolean; message: string }> {
  return post(`/api/Groups/join-requests/${requestId}/reject`, {
    reason: reason || "Pedido rejeitado",
  });
}
