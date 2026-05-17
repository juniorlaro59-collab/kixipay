import { get, post, del } from "./client";

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

// Alias para compatibilidade com código antigo
export async function getGrupo(): Promise<GroupResponse> {
  return getMyGroup();
}

export async function leaveGroup(groupId: string): Promise<void> {
  await del<void>(`/api/Groups/${groupId}/leave`);
}