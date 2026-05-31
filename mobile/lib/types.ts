export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "project_manager" | "safety_officer" | "viewer";
};

export type Detection = {
  label: string;
  bbox: [number, number, number, number];
  description?: string;
};

export type EdgeReportSummary = {
  id: string;
  overallRiskLevel: string;
  cmpRiskLevel: string | null;
  overallDescription: string | null;
  peopleCount: number | null;
  missingHardhats: number | null;
  missingVests: number | null;
  receivedAt: string;
  keepalive?: boolean;
  messageType?: string | null;
  eventImageIncluded?: boolean;
  imageUrl: string;
  detections: Detection[];
  classificationJson?: unknown;
  visionVerificationJson?: unknown;
  constructionSafety?: unknown;
  fireSafety?: unknown;
  propertySecurity?: unknown;
  incidentCount?: number;
};

export type Incident = {
  id: string;
  type: string;
  riskLevel: string;
  status: string;
  recordOnly: boolean;
  reasoning: string | null;
  notes: string | null;
  detectedAt: string;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  dismissedAt: string | null;
  camera: { name: string };
  project: { name: string };
  zone: { name: string };
  assignee: { name: string; email?: string } | null;
  edgeReport: EdgeReportSummary | null;
  notificationLogs?: Array<{
    id: string;
    status: string;
    sentAt: string;
    channel: { name: string; type: string };
  }>;
};

export type DashboardData = {
  kpis: {
    edgeOnline: number;
    edgeTotal: number;
    openIncidents: number;
    highCriticalRisk: number;
    avgResponseTime: number;
  };
  edgeDevices: Array<{
    id: string;
    name: string;
    isOnline: boolean;
    status: string;
    lastReportAt: string | null;
    latestRiskLevel: string | null;
    latestDescription: string | null;
  }>;
  riskCategories: Array<{
    categoryKey: string;
    icon: string;
    openCount: number;
    latestRisk: string | null;
    latestSummary: string | null;
  }>;
  recentAlerts: Array<{
    id: string;
    type: string;
    riskLevel: string;
    status: string;
    cameraName: string;
    detectedAt: string;
  }>;
};

export type EdgeDevice = {
  id: string;
  name: string;
  isOnline: boolean;
  status: string;
  lastReportAt: string | null;
  latestRiskLevel: string | null;
  project: { name: string };
};

export type EdgeDeviceDetail = {
  id: string;
  name: string;
  edgeCameraId: string | null;
  streamUrl: string | null;
  status: string;
  isOnline: boolean;
  lastReportAt: string | null;
  project: { id: string; name: string };
  zone: { name: string } | null;
  incidentCount: number;
  reportCount: number;
  snapshotUrl: string;
  latestAnalysis: EdgeReportSummary | null;
  latestCmpDescription: string | null;
};

export type AnalyticsData = {
  trend: Array<{
    date: string;
    totalReports: number;
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
    ppeCompliance: number | null;
  }>;
  totalReports: number;
  highRiskCount: number;
  totalPeopleDetected: number;
  ppeCompliance: number | null;
  riskPie: { high: number; medium: number; low: number };
};

export type AlertPreference = {
  minRiskLevel: string;
  criticalTypesOnly: boolean;
  alertsEnabled: boolean;
  projectIds: string[];
};
