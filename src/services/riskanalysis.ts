import { get } from "./client";
import { normalizeAngolaPhone } from "./helpers";

export interface RiskAnalysisResult {
  riskLevel: string;
  recommendation: string;
  reason: string;
}

export async function getMyRiskAnalysis(): Promise<RiskAnalysisResult> {
  return get<RiskAnalysisResult>("/api/RiskAnalysis/me");
}

export async function getRiskAnalysisByPhone(phoneNumber: string): Promise<RiskAnalysisResult> {
  return get<RiskAnalysisResult>("/api/RiskAnalysis/by-phone", {
    phoneNumber: normalizeAngolaPhone(phoneNumber),
  });
}