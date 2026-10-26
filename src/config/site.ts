export const site = {
  app: "QMap",
  appFull: "QuarterMap",
  url: process.env.SITE_URL ?? "https://qmap.example.com",
  company: "IT Zeyz",
  companyId: "[ЄДРПОУ / РНОКПП]",
  address: "[Юридична адреса, Київ, Україна]",
  email: "[support@ваш-домен.ua]",
  mapProvider: "[Mapbox / Google Maps / OpenStreetMap]",
  iosUrl: "https://apps.apple.com/",
  androidUrl: "https://play.google.com/store/apps",
  effectiveDate: "2026-10-05",
  minAge: 16,
} as const;

export const isPlaceholder = (v: unknown): boolean =>
  typeof v === "string" && v.trim().startsWith("[");
