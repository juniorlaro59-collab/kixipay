import { get, post, del } from "./client";
import type { Membro, UserRole } from "@/types";

export interface GroupResponse {
  id: string;
  name: string;
  contributionAmount: number;
  frequency: string;
  maxMembers: number;
  currentMembers: number;
  guaranteeFund: number;
  status: string;
}

export interface GroupJoinRequest {
  id: string;
  groupId: string;
  groupName: string;
  userId: string;
  userName: string;
  phoneNumber: string;
  status: string;
  createdAt: string;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
}

export interface PaginatedApiResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface GroupMemberResponse {
  id: string;
  fullName: string;
  phoneNumber: string;
  score: number;
  pendingDebt: number;
  role?: string;
  position?: number;
  totalSaved?: number;
  monthsActive?: number;
  punctuality?: number;
}

export interface CreateGroupRequest {
  name: string;
  contributionAmount: number;
  frequency: string;
  maxMembers: number;
  guaranteeFundContribution: number;
}

export interface JoinGroupRequest {
  groupId: string;
  vouchedByUserId?: string | null;
}

export interface RejectGroupJoinRequest {
  reason: string;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((x: string) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function normalizeMemberStatus(pendingDebt: number): "Pago" | "Pendente" | "Em atraso" {
  if (pendingDebt > 0) return "Em atraso";
  return "Pago";
}

function apiGroupMemberToMembro(member: GroupMemberResponse, index: number): Membro {
  const cores = [
    "#FF5C1A",
    "#1D4ED8",
    "#16A34A",
    "#F5A623",
    "#7C3AED",
    "#DC2626",
    "#0891B2",
    "#059669",
    "#B45309",
    "#BE185D",
    "#6D28D9",
    "#0F766E",
  ];

  return {
    id: member.id,
    nome: member.fullName,
    tel: member.phoneNumber,
    posicao: member.position ?? index + 1,
    totalPoupado: member.totalSaved ?? 0,
    score: member.score ?? 0,
    status: normalizeMemberStatus(member.pendingDebt ?? 0),
    iniciais: getInitials(member.fullName),
    cor: cores[index % cores.length],
    meses: member.monthsActive ?? 1,
    pontualidade: member.punctuality ?? (member.pendingDebt > 0 ? 50 : 100),
  };
}

export async function createGroup(body: CreateGroupRequest): Promise<GroupResponse> {
  return post<GroupResponse>("/api/Groups", body);
}

export async function getGroups(
  page = 1,
  pageSize = 20,
): Promise<PaginatedApiResponse<GroupResponse>> {
  return get<PaginatedApiResponse<GroupResponse>>("/api/Groups", {
    page,
    pageSize,
  });
}

export async function getCoordinatorGroups(
  coordinatorId: string,
): Promise<GroupResponse[]> {
  const response = await get<PaginatedApiResponse<GroupResponse> | GroupResponse[]>(
    `/api/Groups/coordinator/${coordinatorId}`,
  );

  return Array.isArray(response) ? response : response.items;
}

export async function getGroupMembers(
  groupId: string,
  page = 1,
  pageSize = 50,
): Promise<{ membros: Membro[]; total: number }> {
  const response = await get<PaginatedApiResponse<GroupMemberResponse> | GroupMemberResponse[]>(
    `/api/Groups/${groupId}/members`,
    {
      page,
      pageSize,
    },
  );

  const members = Array.isArray(response) ? response : response.items;

  return {
    membros: members.map(apiGroupMemberToMembro),
    total: Array.isArray(response) ? members.length : response.totalItems,
  };
}

export async function joinGroup(body: JoinGroupRequest): Promise<unknown> {
  return post("/api/Groups/join", body);
}

export async function getPendingJoinRequests(
  groupId: string,
  page = 1,
  pageSize = 10,
): Promise<PaginatedApiResponse<GroupJoinRequest>> {
  return get<PaginatedApiResponse<GroupJoinRequest>>(
    `/api/Groups/${groupId}/join-requests`,
    {
      page,
      pageSize,
    },
  );
}

export async function approveJoinRequest(requestId: string): Promise<unknown> {
  return post(`/api/Groups/join-requests/${requestId}/approve`, {});
}

export async function rejectJoinRequest(requestId: string, reason: string): Promise<unknown> {
  return post(`/api/Groups/join-requests/${requestId}/reject`, {
    reason,
  } satisfies RejectGroupJoinRequest);
}

export async function getGroupById(groupId: string): Promise<GroupResponse> {
  return get<GroupResponse>(`/api/Groups/${groupId}`);
}

export async function getMyGroup(): Promise<GroupResponse> {
  return get<GroupResponse>("/api/Groups/my");
}

export async function getGrupo(): Promise<GroupResponse> {
  return getMyGroup();
}

export async function leaveGroup(groupId: string): Promise<void> {
  await del<void>(`/api/Groups/${groupId}/leave`);
}