import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type {
  AlertPreference,
  AnalyticsData,
  AuthUser,
  DashboardData,
  EdgeDevice,
  EdgeDeviceDetail,
  EdgeReportSummary,
  Incident,
} from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";

function useLocaleParam() {
  const { locale } = useLocale();
  return locale;
}

export function useDashboard() {
  const locale = useLocaleParam();
  return useQuery({
    queryKey: ["dashboard", locale],
    queryFn: async () => {
      const res = await apiFetch<DashboardData>("/api/mobile/dashboard", { locale });
      if (!res.ok) throw new Error(res.error.message);
      return res.data;
    },
    refetchInterval: 10_000,
  });
}

export function useIncidents(filters?: { status?: string; riskLevel?: string }) {
  const locale = useLocaleParam();
  const params = new URLSearchParams({ limit: "50" });
  if (filters?.status) params.set("status", filters.status);
  if (filters?.riskLevel) params.set("riskLevel", filters.riskLevel);

  return useQuery({
    queryKey: ["incidents", locale, filters?.status, filters?.riskLevel],
    queryFn: async () => {
      const res = await apiFetch<{ incidents: Incident[] }>(
        `/api/mobile/incidents?${params.toString()}`,
        { locale }
      );
      if (!res.ok) throw new Error(res.error.message);
      return res.data.incidents;
    },
    refetchInterval: 10_000,
  });
}

export function useIncident(id: string) {
  const locale = useLocaleParam();
  return useQuery({
    queryKey: ["incident", id, locale],
    queryFn: async () => {
      const res = await apiFetch<{ incident: Incident }>(`/api/mobile/incidents/${id}`, { locale });
      if (!res.ok) throw new Error(res.error.message);
      return res.data.incident;
    },
    enabled: Boolean(id),
    refetchInterval: 15_000,
  });
}

export function usePatchIncident(id: string) {
  const qc = useQueryClient();
  const locale = useLocaleParam();
  return useMutation({
    mutationFn: async (body: { status?: string; notes?: string }) => {
      const res = await apiFetch<{ incident: Incident }>(`/api/mobile/incidents/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
        locale,
      });
      if (!res.ok) throw new Error(res.error.message);
      return res.data.incident;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["incident", id] });
      void qc.invalidateQueries({ queryKey: ["incidents"] });
      void qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useEdgeDevices() {
  return useQuery({
    queryKey: ["edge-devices"],
    queryFn: async () => {
      const res = await apiFetch<{ devices: EdgeDevice[] }>("/api/mobile/edge-devices");
      if (!res.ok) throw new Error(res.error.message);
      return res.data.devices;
    },
    refetchInterval: 15_000,
  });
}

export function useEdgeDevice(id: string) {
  const locale = useLocaleParam();
  return useQuery({
    queryKey: ["edge-device", id, locale],
    queryFn: async () => {
      const res = await apiFetch<{ device: EdgeDeviceDetail }>(`/api/mobile/edge-devices/${id}`, {
        locale,
      });
      if (!res.ok) throw new Error(res.error.message);
      return res.data.device;
    },
    enabled: Boolean(id),
    refetchInterval: 15_000,
  });
}

export function useEdgeDeviceReports(id: string, filter: string) {
  const locale = useLocaleParam();
  return useQuery({
    queryKey: ["edge-device-reports", id, filter, locale],
    queryFn: async () => {
      const res = await apiFetch<{ reports: EdgeReportSummary[] }>(
        `/api/mobile/edge-devices/${id}/reports?filter=${filter}&limit=50`,
        { locale }
      );
      if (!res.ok) throw new Error(res.error.message);
      return res.data.reports;
    },
    enabled: Boolean(id),
    refetchInterval: 15_000,
  });
}

export function useEdgeReport(id: string) {
  const locale = useLocaleParam();
  return useQuery({
    queryKey: ["edge-report", id, locale],
    queryFn: async () => {
      const res = await apiFetch<{ report: EdgeReportSummary & { camera: { id: string; name: string } } }>(
        `/api/mobile/edge-reports/${id}`,
        { locale }
      );
      if (!res.ok) throw new Error(res.error.message);
      return res.data.report;
    },
    enabled: Boolean(id),
    refetchInterval: 15_000,
  });
}

export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await apiFetch<{ data: AnalyticsData }>("/api/mobile/analytics");
      if (!res.ok) throw new Error(res.error.message);
      return res.data.data;
    },
    refetchInterval: 60_000,
  });
}

export function useAlertPreferences() {
  return useQuery({
    queryKey: ["alert-preferences"],
    queryFn: async () => {
      const res = await apiFetch<{
        preference: AlertPreference;
        projectScope: Array<{ id: string; name: string }>;
      }>("/api/mobile/alert-preferences");
      if (!res.ok) throw new Error(res.error.message);
      return res.data;
    },
  });
}

export function useProjects() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await apiFetch<{ projects: Array<{ id: string; name: string; location: string | null }> }>(
        "/api/mobile/projects"
      );
      if (!res.ok) throw new Error(res.error.message);
      return res.data.projects;
    },
    enabled: user?.role === "admin",
  });
}

export function usePatchAlertPreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<AlertPreference>) => {
      const res = await apiFetch<{ preference: AlertPreference }>("/api/mobile/alert-preferences", {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(res.error.message);
      return res.data.preference;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["alert-preferences"] });
    },
  });
}

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await apiFetch<{ user: AuthUser }>("/api/mobile/me");
      if (!res.ok) throw new Error(res.error.message);
      return res.data.user;
    },
  });
}
