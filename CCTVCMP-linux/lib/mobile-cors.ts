import { NextRequest, NextResponse } from "next/server";

const MOBILE_API_PREFIX = "/api/mobile";
const IMAGE_PATH = /^\/api\/edge-reports\/[^/]+\/image$/;
const SNAPSHOT_PATH = /^\/api\/edge-devices\/[^/]+\/snapshot$/;

function isMobileCorsPath(pathname: string) {
  return pathname.startsWith(MOBILE_API_PREFIX) || IMAGE_PATH.test(pathname) || SNAPSHOT_PATH.test(pathname);
}

function isAllowedOrigin(origin: string) {
  const configured = process.env.MOBILE_WEB_ORIGINS?.split(",").map((v) => v.trim()).filter(Boolean) ?? [];
  if (configured.includes(origin)) return true;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  return false;
}

function corsHeaders(origin: string | null) {
  if (!origin || !isAllowedOrigin(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type, x-cmp-locale",
    "Access-Control-Max-Age": "86400",
  };
}

export function applyMobileCors(request: NextRequest, response: NextResponse) {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  return response;
}

export function handleMobileCorsPreflight(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (request.method !== "OPTIONS" || !isMobileCorsPath(pathname)) return null;
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);
  if (!Object.keys(headers).length) {
    return new NextResponse(null, { status: 403 });
  }
  return new NextResponse(null, { status: 204, headers });
}

export function shouldApplyMobileCors(pathname: string) {
  return isMobileCorsPath(pathname);
}
