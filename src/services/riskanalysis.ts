import { get } from "./client";

export interface RiskAnalysisResult {
  userId: string;
  fullName: string;
  phoneNumber: string;
  score: number;
  riskLevel: string;
  factors: { factor: string; impact: string; weight: number }[];
  recommendation: string;
  analysedAt: string;
}

export async function getMyRiskAnalysis(): Promise<RiskAnalysisResult> {
  return get<RiskAnalysisResult>("/api/RiskAnalysis/me");
}

export async function getRiskAnalysisByPhone(phoneNumber: string): Promise<RiskAnalysisResult> {
  return get<RiskAnalysisResult>("/api/RiskAnalysis/by-phone", { phoneNumber });
}
