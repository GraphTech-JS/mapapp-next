"use client";

import { useEffect } from "react";
import {
  GA_MEASUREMENT_ID,
  loadGoogleAnalytics,
  readCookieConsent,
  updateAnalyticsConsent,
  type CookieConsent,
} from "@/lib/analytics";

export default function GoogleAnalytics() {
  useEffect(() => {
    loadGoogleAnalytics(readCookieConsent(), GA_MEASUREMENT_ID);
    const onConsent = (event: Event) => {
      updateAnalyticsConsent((event as CustomEvent<CookieConsent>).detail);
    };
    window.addEventListener("qm-cookie-consent", onConsent);
    return () => window.removeEventListener("qm-cookie-consent", onConsent);
  }, []);

  return null;
}
