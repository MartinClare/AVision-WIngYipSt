export type Locale = "en" | "zh-Hant";

type MessageTree = Record<string, unknown>;

const messages: Record<Locale, MessageTree> = {
  en: {
    tabs: {
      dashboard: "Dashboard",
      incidents: "Incidents",
      edge: "Edge",
      analytics: "Analytics",
      settings: "Settings",
    },
    login: {
      title: "Sign in",
      subtitle: "Sign in with your CMP account",
      email: "Email",
      password: "Password",
      action: "Sign in",
      error: "Invalid credentials",
    },
    dashboard: {
      title: "Dashboard",
      openIncidents: "Open incidents",
      highCritical: "High / critical",
      edgeOnline: "Edge devices online",
      avgResponse: "Avg response (min)",
      edgeStatus: "Edge status",
      riskByCategory: "Risk by category",
      recentAlerts: "Recent alerts",
      categories: {
        PPE: "PPE",
        Construction: "Construction",
        Fire: "Fire",
        Security: "Security",
      },
      openCount: "{count} open",
      noAlerts: "No recent alerts",
    },
    incidents: {
      title: "Incidents",
      empty: "No incidents",
      filters: "Filters",
      all: "All",
      assigned: "Assigned: {value}",
      record: "record",
      acknowledge: "Acknowledge",
      resolve: "Resolve",
      dismiss: "Dismiss",
      details: "Details",
      assignedTo: "Assigned to",
      detectedAt: "Detected at",
      acknowledgedAt: "Acknowledged at",
      resolvedAt: "Resolved at",
      dismissedAt: "Dismissed at",
      evidence: "Evidence",
      reasoning: "Reasoning",
      notes: "Notes",
      saveNotes: "Save notes",
      notifications: "Notifications",
      unassigned: "Unassigned",
      incidentTitle: "Incident",
      viewEdgeReport: "View edge report",
      classification: "Classification",
      vision: "Vision verification",
      safety: "Safety analysis",
      types: {
        ppe_violation: "PPE violation",
        fall_risk: "Fall risk",
        restricted_zone_entry: "Restricted zone",
        machinery_hazard: "Machinery hazard",
        near_miss: "Near miss",
        smoking: "Smoking",
        fire_detected: "Fire detected",
        smoke_detected: "Smoke detected",
      },
    },
    edge: {
      title: "Edge devices",
      empty: "No edge devices",
      online: "Online",
      offline: "Offline",
      latestRisk: "Latest risk: {value}",
      lastReport: "Last report: {value}",
      detail: "Device detail",
      snapshot: "Latest snapshot",
      latestAnalysis: "Latest analysis",
      reportFeed: "Report feed",
      filterAll: "All",
      filterAnalysis: "Analysis",
      filterAlerts: "Alerts",
      filterKeepalive: "Keepalive",
      reports: "{count} reports",
      incidents: "{count} incidents",
    },
    edgeReport: {
      title: "Edge report",
      keepaliveWarning: "This is a keepalive report — analysis may be limited.",
      noImage: "No image available",
      detections: "{count} detections",
    },
    analytics: {
      title: "Analytics",
      totalReports: "Total reports (30d)",
      highRisk: "High risk reports",
      peopleDetected: "People detected",
      ppeCompliance: "PPE compliance",
      dailyTrend: "Daily trend",
      riskDistribution: "Risk distribution",
      ppeTrend: "PPE compliance trend",
    },
    settings: {
      title: "Settings",
      signedIn: "Signed in",
      language: "Language",
      english: "English",
      traditionalChinese: "繁體中文",
      adminNote: "Alert thresholds are managed by CMP administrators.",
      alertThreshold: "Alert threshold",
      notifyAbove: "Notify when incident risk is at or above:",
      alertsEnabled: "Alerts enabled",
      criticalOnly: "Critical incident types only",
      projectFilter: "Project filter",
      allProjects: "All projects",
      pushNotifications: "Push notifications",
      registerPush: "Register this device for push",
      sendTest: "Send test notification",
      signOut: "Sign out",
      saved: "Saved",
      pushRegistered: "Push token registered",
      pushDenied: "Push permission denied or unavailable",
      testSent: "Test sent ({count} device(s))",
      pushUnavailable: "Push requires a standalone APK on Android.",
    },
    common: {
      loading: "Loading…",
      retry: "Retry",
      back: "Back",
      risk: {
        low: "low",
        medium: "medium",
        high: "high",
        critical: "critical",
      },
      status: {
        open: "open",
        acknowledged: "acknowledged",
        resolved: "resolved",
        dismissed: "dismissed",
        record_only: "record only",
      },
    },
  },
  "zh-Hant": {
    tabs: {
      dashboard: "儀表板",
      incidents: "事件",
      edge: "邊緣設備",
      analytics: "分析",
      settings: "設定",
    },
    login: {
      title: "登入",
      subtitle: "使用 CMP 帳戶登入",
      email: "電郵",
      password: "密碼",
      action: "登入",
      error: "登入失敗",
    },
    dashboard: {
      title: "儀表板",
      openIncidents: "未處理事件",
      highCritical: "高 / 嚴重風險",
      edgeOnline: "在線邊緣設備",
      avgResponse: "平均回應（分鐘）",
      edgeStatus: "邊緣狀態",
      riskByCategory: "風險分類",
      recentAlerts: "最近警報",
      categories: {
        PPE: "個人防護",
        Construction: "施工",
        Fire: "消防",
        Security: "保安",
      },
      openCount: "{count} 未處理",
      noAlerts: "沒有最近警報",
    },
    incidents: {
      title: "事件",
      empty: "沒有事件",
      filters: "篩選",
      all: "全部",
      assigned: "負責人：{value}",
      record: "僅記錄",
      acknowledge: "確認",
      resolve: "解決",
      dismiss: "忽略",
      details: "詳情",
      assignedTo: "負責人",
      detectedAt: "偵測時間",
      acknowledgedAt: "確認時間",
      resolvedAt: "解決時間",
      dismissedAt: "忽略時間",
      evidence: "證據",
      reasoning: "分析理由",
      notes: "備註",
      saveNotes: "儲存備註",
      notifications: "通知記錄",
      unassigned: "未分配",
      incidentTitle: "事件",
      viewEdgeReport: "查看邊緣報告",
      classification: "分類",
      vision: "視覺驗證",
      safety: "安全分析",
      types: {
        ppe_violation: "PPE 違規",
        fall_risk: "墜落風險",
        restricted_zone_entry: "禁區進入",
        machinery_hazard: "機械危險",
        near_miss: "僅差事故",
        smoking: "吸煙",
        fire_detected: "火災",
        smoke_detected: "煙霧",
      },
    },
    edge: {
      title: "邊緣設備",
      empty: "沒有邊緣設備",
      online: "在線",
      offline: "離線",
      latestRisk: "最新風險：{value}",
      lastReport: "最後報告：{value}",
      detail: "設備詳情",
      snapshot: "最新快照",
      latestAnalysis: "最新分析",
      reportFeed: "報告動態",
      filterAll: "全部",
      filterAnalysis: "分析",
      filterAlerts: "警報",
      filterKeepalive: "心跳",
      reports: "{count} 報告",
      incidents: "{count} 事件",
    },
    edgeReport: {
      title: "邊緣報告",
      keepaliveWarning: "此為心跳報告，分析可能有限。",
      noImage: "沒有可用圖片",
      detections: "{count} 個偵測",
    },
    analytics: {
      title: "分析",
      totalReports: "報告總數（30天）",
      highRisk: "高風險報告",
      peopleDetected: "偵測人數",
      ppeCompliance: "PPE 合規率",
      dailyTrend: "每日趨勢",
      riskDistribution: "風險分佈",
      ppeTrend: "PPE 合規趨勢",
    },
    settings: {
      title: "設定",
      signedIn: "已登入",
      language: "語言",
      english: "English",
      traditionalChinese: "繁體中文",
      adminNote: "警報閾值由 CMP 管理員設定。",
      alertThreshold: "警報閾值",
      notifyAbove: "當事件風險達到或以上時通知：",
      alertsEnabled: "啟用警報",
      criticalOnly: "僅限嚴重事件類型",
      projectFilter: "項目篩選",
      allProjects: "所有項目",
      pushNotifications: "推送通知",
      registerPush: "註冊此裝置推送",
      sendTest: "發送測試通知",
      signOut: "登出",
      saved: "已儲存",
      pushRegistered: "推送令牌已註冊",
      pushDenied: "推送權限被拒或不可用",
      testSent: "已發送測試（{count} 個裝置）",
      pushUnavailable: "Android 推送需要獨立 APK。",
    },
    common: {
      loading: "載入中…",
      retry: "重試",
      back: "返回",
      risk: {
        low: "低",
        medium: "中",
        high: "高",
        critical: "嚴重",
      },
      status: {
        open: "未處理",
        acknowledged: "已確認",
        resolved: "已解決",
        dismissed: "已忽略",
        record_only: "僅記錄",
      },
    },
  },
};

function lookup(dict: MessageTree, key: string): string | undefined {
  const parts = key.split(".");
  let cur: unknown = dict;
  for (const part of parts) {
    if (typeof cur !== "object" || cur === null || !(part in (cur as Record<string, unknown>))) {
      return undefined;
    }
    cur = (cur as Record<string, unknown>)[part];
  }
  return typeof cur === "string" ? cur : undefined;
}

export function translate(locale: Locale, key: string, vars?: Record<string, string | number>) {
  const raw = lookup(messages[locale], key) ?? lookup(messages.en, key) ?? key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`));
}

export function incidentTypeLabel(locale: Locale, type: string) {
  return translate(locale, `incidents.types.${type}`, {}) === `incidents.types.${type}`
    ? type.replace(/_/g, " ")
    : translate(locale, `incidents.types.${type}`);
}

export function formatDateTime(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}
