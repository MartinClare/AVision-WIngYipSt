import type { TranslationsJson } from "@/lib/translator";
import { extractDetections } from "@/lib/detections";

export type MobileLocale = "en" | "zh";

export function parseMobileLocale(value: string | null | undefined): MobileLocale {
  if (!value) return "en";
  const normalized = value.trim().toLowerCase();
  if (normalized === "zh" || normalized === "zh-hant" || normalized === "zh-hk") return "zh";
  return "en";
}

export function resolveMobileLocale(request: Request): MobileLocale {
  const url = new URL(request.url);
  const fromQuery = url.searchParams.get("locale");
  const fromHeader = request.headers.get("x-cmp-locale");
  return parseMobileLocale(fromQuery ?? fromHeader);
}

type EdgeReportFields = {
  id: string;
  overallRiskLevel: string;
  overallDescription: string | null;
  peopleCount?: number | null;
  missingHardhats?: number | null;
  missingVests?: number | null;
  receivedAt: Date;
  rawJson?: unknown;
  translationsJson?: unknown;
  classificationJson?: unknown;
  visionVerificationJson?: unknown;
  constructionSafety?: unknown;
  fireSafety?: unknown;
  propertySecurity?: unknown;
  keepalive?: boolean;
  messageType?: string;
  eventImageIncluded?: boolean;
  cmpRiskLevel?: string | null;
};

export function localizedOverallDescription(
  report: Pick<EdgeReportFields, "overallDescription" | "translationsJson">,
  locale: MobileLocale
): string | null {
  const translations = (report.translationsJson ?? null) as TranslationsJson | null;
  if (locale === "zh" && translations?.overallDescription) {
    return translations.overallDescription;
  }
  return report.overallDescription;
}

export function serializeEdgeReportForMobile(
  report: EdgeReportFields,
  publicBaseUrl: string,
  locale: MobileLocale = "en"
) {
  const translations = (report.translationsJson ?? null) as TranslationsJson | null;
  const visionVerification = (report.visionVerificationJson ?? null) as Record<string, unknown> | null;

  let visionSummary: string | undefined;
  let visionMissedHazards: string[] | undefined;
  let visionIncorrectClaims: string[] | undefined;

  if (locale === "zh" && translations) {
    visionSummary = translations.visionSummary;
    visionMissedHazards = translations.visionMissedHazards;
    visionIncorrectClaims = translations.visionIncorrectClaims;
  } else if (visionVerification) {
    visionSummary = typeof visionVerification.summary === "string" ? visionVerification.summary : undefined;
    visionMissedHazards = Array.isArray(visionVerification.missedHazards)
      ? (visionVerification.missedHazards as string[])
      : undefined;
    visionIncorrectClaims = Array.isArray(visionVerification.incorrectClaims)
      ? (visionVerification.incorrectClaims as string[])
      : undefined;
  }

  const classificationJson = report.classificationJson as
    | { classifications?: Array<{ type: string; detected: boolean; riskLevel: string; confidence: number; reasoning: string }> }
    | null
    | undefined;

  const classifications = (classificationJson?.classifications ?? []).map((item) => {
    if (locale === "zh" && translations?.classifications) {
      const match = translations.classifications.find((c) => c.type === item.type);
      if (match?.reasoning) {
        return { ...item, reasoning: match.reasoning };
      }
    }
    return item;
  });

  return {
    id: report.id,
    overallRiskLevel: report.overallRiskLevel,
    cmpRiskLevel: report.cmpRiskLevel ?? null,
    overallDescription: localizedOverallDescription(report, locale),
    peopleCount: report.peopleCount ?? null,
    missingHardhats: report.missingHardhats ?? null,
    missingVests: report.missingVests ?? null,
    receivedAt: report.receivedAt,
    keepalive: report.keepalive ?? false,
    messageType: report.messageType ?? null,
    eventImageIncluded: report.eventImageIncluded ?? false,
    imageUrl: `${publicBaseUrl}/api/edge-reports/${report.id}/image`,
    detections: extractDetections(report.rawJson ?? null),
    classificationJson: classificationJson ? { ...classificationJson, classifications } : null,
    visionVerificationJson: visionVerification
      ? {
          ...visionVerification,
          summary: visionSummary ?? visionVerification.summary,
          missedHazards: visionMissedHazards ?? visionVerification.missedHazards,
          incorrectClaims: visionIncorrectClaims ?? visionVerification.incorrectClaims,
        }
      : null,
    constructionSafety: report.constructionSafety ?? null,
    fireSafety: report.fireSafety ?? null,
    propertySecurity: report.propertySecurity ?? null,
  };
}
