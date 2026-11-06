const DEFAULT_URL = "https://qmaply.com";

function resolveSiteUrl(): string {
  const raw = process.env.SITE_URL?.trim();
  if (!raw) return DEFAULT_URL;
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host.endsWith(".sslip.io") ||
      host.endsWith(".local") ||
      /^\d{1,3}(\.\d{1,3}){3}$/.test(host)
    ) {
      return DEFAULT_URL;
    }
    return url.origin;
  } catch {
    return DEFAULT_URL;
  }
}

export const site = {
  app: "QMaply",
  appFull: "QMaply",
  url: resolveSiteUrl(),
  company: "IT Zeyz",
  companyUrl: "https://itzeyz.com",
  email: "support@qmaply.com",
  domain: "qmaply.com",
  iosUrl: "https://apps.apple.com/",
  androidUrl: "https://play.google.com/store/apps",
  effectiveDate: "2026-10-05",
  minAge: 16,
  locale: "uk_UA",
  geo: {
    region: "UA-30",
    placename: "Kyiv",
    position: "50.5018;30.4148",
    icbm: "50.5018, 30.4148",
  },
} as const;

export const isPlaceholder = (v: unknown): boolean =>
  typeof v === "string" && v.trim().startsWith("[");
