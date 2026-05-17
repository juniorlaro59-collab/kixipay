import { get, post } from "./client";
import type { PaginatedApiResponse } from "./groups";

export interface CycleResponse {
    id: string;
    groupId: string;
    cycleNumber: number;
    beneficiaryName: string;
    deadlineDate: string;
    status: string;
    totalCollected: number;
    beneficiaryReleaseAmount: number;
    totalContributions: number;
    pendingContributions: number;
}

export interface CycleContribution {
    id: string;
    userName: string;
    amount: number;
    status: string;
    paidAt?: string | null;
}

export interface RegisterContributionRequest {
    cycleId: string;
    transactionReference: string;
}

export async function getCurrentCycle(groupId: string): Promise<CycleResponse> {
    return get<CycleResponse>(`/api/Cycles/group/${groupId}/current`);
}

export async function startNextCycle(groupId: string): Promise<CycleResponse> {
    return post<CycleResponse>(`/api/Cycles/group/${groupId}/start`, {});
}

export async function registerContribution(
    body: RegisterContributionRequest,
): Promise<unknown> {
    return post("/api/Cycles/contribute", body);
}

export async function getCycleContributions(
    cycleId: string,
    page = 1,
    pageSize = 20,
): Promise<PaginatedApiResponse<CycleContribution>> {
    return get<PaginatedApiResponse<CycleContribution>>(
        `/api/Cycles/${cycleId}/contributions`,
        {
            page,
            pageSize,
        },
    );
}