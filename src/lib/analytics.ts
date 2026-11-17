export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "G-3VSEL35G3R";

export const COOKIE_CONSENT_KEY = "qm-cookie-consent";

export type CookieConsent = "analytics" | "necessary";

export function isAnalyticsEnabled() {
  return Boolean(GA_MEASUREMENT_ID);
}

export function readCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const value = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (value === "analytics" || value === "necessary") return value;
  } catch {
    /* ignore */
  }
  return null;
}

export function writeCookieConsent(value: CookieConsent) {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, value);
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("qm-cookie-consent", { detail: value }),
    );
  }
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function loadGoogleAnalytics(measurementId = GA_MEASUREMENT_ID) {
  if (typeof window === "undefined" || !measurementId) return;
  if (document.getElementById("ga4-gtag")) return;

  window.dataLayer = window.dataLayer || [];
  // gtag.js only processes Arguments objects pushed to dataLayer, not arrays.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", measurementId, { anonymize_ip: true });

  const script = document.createElement("script");
  script.id = "ga4-gtag";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);
}
