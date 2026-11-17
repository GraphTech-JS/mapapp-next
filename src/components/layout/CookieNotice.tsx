"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  isAnalyticsEnabled,
  readCookieConsent,
  writeCookieConsent,
} from "@/lib/analytics";

export default function CookieNotice() {
  const t = useTranslations("cookieNotice");
  const analyticsOn = isAnalyticsEnabled();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(!readCookieConsent());
  }, []);

  if (!show) return null;

  const choose = (value: "analytics" | "necessary") => {
    writeCookieConsent(value);
    setShow(false);
  };

  return (
    <div
      role="region"
      aria-label="Cookie"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto flex max-w-[560px] animate-rise-in flex-col gap-3 rounded-[22px] border border-line bg-white p-4 shadow-[0_24px_50px_-24px_rgba(60,30,10,.45)] sm:bottom-5 sm:p-5"
    >
      <p className="text-sm text-ink-2">
        {analyticsOn ? t("textAnalytics") : t("text")}{" "}
        <Link
          href="/cookies"
          className="font-semibold text-orange-deep underline underline-offset-3 hover:text-orange"
        >
          {t("more")}
        </Link>
      </p>
      {analyticsOn ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => choose("necessary")}
            className="rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink-2 hover:bg-tint"
          >
            {t("necessary")}
          </button>
          <button
            type="button"
            onClick={() => choose("analytics")}
            className="rounded-full bg-orange px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-deep"
          >
            {t("accept")}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => choose("necessary")}
          className="self-start rounded-full bg-orange px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-deep sm:self-end"
        >
          {t("ok")}
        </button>
      )}
    </div>
  );
}
