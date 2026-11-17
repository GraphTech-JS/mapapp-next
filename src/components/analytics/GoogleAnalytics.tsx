"use client";

import { useEffect, useState } from "react";
import {
  GA_MEASUREMENT_ID,
  isAnalyticsEnabled,
  loadGoogleAnalytics,
  readCookieConsent,
  type CookieConsent,
} from "@/lib/analytics";

export default function GoogleAnalytics() {
  const [consent, setConsent] = useState<CookieConsent | null>(null);

  useEffect(() => {
    setConsent(readCookieConsent());
    const onConsent = (event: Event) => {
      const detail = (event as CustomEvent<CookieConsent>).detail;
      setConsent(detail);
    };
    window.addEventListener("qm-cookie-consent", onConsent);
    return () => window.removeEventListener("qm-cookie-consent", onConsent);
  }, []);

  useEffect(() => {
    if (!isAnalyticsEnabled()) return;
    if (consent !== "analytics") return;
    loadGoogleAnalytics(GA_MEASUREMENT_ID);
  }, [consent]);

  return null;
}
